import { htmlToBlocks } from "@sanity/block-tools";
import { Schema } from "@sanity/schema";
import { uuid } from "@sanity/uuid";
import { JSDOM } from "jsdom";
import pLimit from "p-limit";
import type { FieldDefinition, SanityClient } from "sanity";

import type { Post } from "../../../sanity.types";
import { schemaTypes } from "../../../schemaTypes";
import { sanityUploadFromUrl } from "../../../utilities/common/sanityUploadFromUrl";

import {processImages} from '../../../utilities/default/utils'
import {getPortableTextRules} from '../../../modules/htmlToBlocksCore'


// ✅ Compile Sanity Schema
const defaultSchema = Schema.compile({ types: schemaTypes });
const blockContentSchema = defaultSchema
  .get("post")
  .fields.find((field: FieldDefinition) => field.name === "content").type;

// ✅ Debug Logger
const debugLog = (message: string, data?: any) => {
  console.log(`🔎 [DEBUG] ${message}: `, JSON.stringify(data, null, 2));
};

function sanitizeNestedBlocks(columnContent) {
  return columnContent.map((block) => {
    if (block._type === "block" && Array.isArray(block.children)) {
      const flattenedChildren = block.children.flatMap((child) => {
        // If child is a __block wrapper, unwrap it
        if (child._type === "__block" && child.block?._type === "block") {
          return child.block.children || []; // return the unwrapped span(s)
        }
        return child; // return normal span
      });

      return {
        ...block,
        children: flattenedChildren,
      };
    }

    return block;
  });
}

function removeEmptyTextBlocks(blocks) {
  return blocks
    .map((block) => {
      // ✅ Trim span text directly
      if (block._type === "span" && typeof block.text === "string") {
        return {
          ...block,
          text: block.text.trim(),
        };
      }

      // ✅ Trim each span inside a block
      if (block._type === "block" && Array.isArray(block.children)) {
        const trimmedChildren = block.children.map((child) => {
          if (child._type === "span" && typeof child.text === "string") {
            return {
              ...child,
              text: child.text.trim(),
            };
          }
          return child;
        });

        return {
          ...block,
          children: trimmedChildren,
        };
      }

      return block;
    })
    .filter((block) => {
      // ✅ Remove empty spans
      if (block._type === "span") {
        return block.text && block.text.trim().length > 0;
      }

      // ✅ Remove blocks with no visible text
      if (block._type === "block" && Array.isArray(block.children)) {
        const combinedText = block.children
          .map((child) => child?.text || "")
          .join("")
          .trim();

        return combinedText.length > 0;
      }

      // ✅ Keep everything else
      return true;
    });
}


// ✅ Convert HTML to Sanity Block Content
export async function htmlToBlockContent(
  html: string,
  client: SanityClient
): Promise<Post["content"]> {
  if (!client) {
    throw new Error("❌ Sanity Client is not defined! Make sure you pass it correctly.");
  }

  let blocks = htmlToBlocks(html, blockContentSchema, {
    parseHtml: (html) => {
      const dom = new JSDOM(html);
      return dom.window.document;
    },
    rules: getPortableTextRules(),
  });
  // ✅ Process Images for External Images
  blocks = await processImages(blocks, client);

  // ✅ Process Nested Content inside Columns, MediaText, and Tables
  blocks = await Promise.all(
    blocks.map(async (block) => {  
      if (block._type === "mediaText") {
        debugLog("🔎 Processing mediaText block:", block);

        if (block.imageAssets && block.imageAssets.url) {
          debugLog("🚀 Uploading mediaText Image:", block.imageAssets.url);

          if (!block.imageAssets.asset._ref) {
            const imageDocument = await sanityUploadFromUrl(block.imageAssets.url, client, {
              filename: block.imageAssets.url.split("/").pop() || "image",
            });

            if (imageDocument) {
              block.imageAssets.asset._ref = imageDocument._id;
              delete block.imageAssets.url;
              debugLog("✅ Updated mediaText I mage _ref:", block.imageAssets.asset._ref);
            } else {
              console.warn("❌ Image Upload Failed for mediaText:", block.imageAssets.url);
            }
          }
        }
      }

      if (block._type === "columns" && block.columns) {
        debugLog("🔎 Processing columns block:", block);

        block.columns = await Promise.all(
          block.columns.map(async (column) => {
            // ✅ Pass the full content array to processImages
            column.content = await processImages(column.content, client);

            column.content = sanitizeNestedBlocks(column.content);

            column.content = removeEmptyTextBlocks(column.content);

            return column;
          })
        );
      }

      return block;
    })
  );

  debugLog("✅ Final Processed Blocks", blocks);
  return blocks;
}
