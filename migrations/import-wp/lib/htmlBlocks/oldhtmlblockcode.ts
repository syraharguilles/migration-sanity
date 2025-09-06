import { htmlToBlocks } from "@sanity/block-tools";
import { Schema } from "@sanity/schema";
import { uuid } from "@sanity/uuid";
import { JSDOM } from "jsdom";
import pLimit from "p-limit";
import type { FieldDefinition, SanityClient } from "sanity";

import type { Post } from "../../../sanity.types";
import { schemaTypes } from "../../../schemaTypes";
import { sanityUploadFromUrl } from "./sanityUploadFromUrl";

// ✅ Compile Sanity Schema
const defaultSchema = Schema.compile({ types: schemaTypes });
const blockContentSchema = defaultSchema
  .get("post")
  .fields.find((field: FieldDefinition) => field.name === "content").type;

// ✅ Debug Logger
const debugLog = (message: string, data?: any) => {
  console.log(🔎 [DEBUG] ${message}: , JSON.stringify(data, null, 2));
};

// ✅ Process Image Uploads & Ensure _ref is assigned
async function processImages(blocks: any[], client: SanityClient) {
  if (!client) {
    throw new Error("❌ Sanity Client is not defined! Make sure you pass it correctly.");
  }

  const limit = pLimit(2);

  return await Promise.all(
    blocks.map((block) =>
      limit(async () => {
        if (block._type === "externalImage" && block.imageAssets?.url) {
          debugLog("🚀 Processing External Image BEFORE Upload", block.imageAssets);

          if (!block.imageAssets.asset._ref) {
            const imageDocument = await sanityUploadFromUrl(block.imageAssets.url, client, {
              filename: block.imageAssets.url.split("/").pop() || "image",
            });

            if (imageDocument) {
              block.imageAssets.asset._ref = imageDocument._id;
              delete block.imageAssets.url;
              debugLog("✅ Processed External Image AFTER Upload", block.imageAssets);
            } else {
              console.warn("❌ Image Upload Failed:", block.imageAssets.url);
            }
          }
        }

        return block;
      })
    )
  );
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
    parseHtml: (html) => new JSDOM(html).window.document,
    rules: [
      {
        deserialize(node, next, block) {          
      
          if (node.nodeName.toLowerCase() === "div" && node.classList.contains("wp-block-media-text")) {
            console.log("✅ Found wp-block-media-text");
      
            const imgEl = node.querySelector("figure img");
            const contentEl = node.querySelector(".wp-block-media-text__content");
      
            const imageUrl = imgEl?.getAttribute("src") || null;
            const textBlocks = contentEl ? next(contentEl.childNodes) : [];
      
            // ✅ Fix: Ensure content has the correct structure
            const formattedContent = textBlocks.map((block) => ({
              _key: block._key || uuid(),
              _type: "block",
              children: block.children || [],
              markDefs: block.markDefs || [],
              style: block.style || "normal",
            }));
      
            const mediaTextBlock = block({
              _type: "mediaText",
              _key: uuid(),
              content: formattedContent,
              imageAssets: imageUrl
                ? {
                    _type: "externalImage",
                    asset: { _type: "reference", _ref: null },
                    url: imageUrl,
                  }
                : null,
              imagePosition: node.classList.contains("has-media-on-the-right") ? "right" : "left",
              verticalAlignment: node.classList.contains("is-vertically-aligned-top")
                ? "top"
                : node.classList.contains("is-vertically-aligned-bottom")
                ? "bottom"
                : "center",
            });
          
            return mediaTextBlock;
          }
      
          return undefined;
        }
      },
      {
        // ✅ Handle WordPress Columns
        deserialize(node, next, block) {
          const el = node as HTMLElement;
          if (el.nodeName.toLowerCase() === "div" && el.classList.contains("wp-block-columns")) {
            const columns = Array.from(el.children)
              .filter((child) => child.classList.contains("wp-block-column"))
              .map((columnEl) => ({
                _type: "column",
                _key: uuid(),
                content: next(columnEl.childNodes),
              }));

            return block({
              _type: "columns",
              _key: uuid(),
              columns,
            });
          }
          return undefined;
        },
      }
    ],
  });

  // ✅ Process Images for External Images
  blocks = await processImages(blocks, client);

  debugLog("BLOCKS MAIN: ", blocks);

  // ✅ Process Images within Columns & MediaText
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
              debugLog("✅ Updated mediaText Image _ref:", block.imageAssets.asset._ref);
            } else {
              console.warn("❌ Image Upload Failed for mediaText:", block.imageAssets.url);
            }
          }
        }
      }

      if (block._type === "columns") {
        if (block.columns) {         
          block.columns = await Promise.all(
            block.columns.map(async (column) => {
              column.content = (
                await Promise.all(
                  column.content.map(async (contentBlock) => {
                    // ❌ Fix: Skip empty spans
                    if (contentBlock._type === "span" && (!contentBlock.text || contentBlock.text.trim() === "")) {
                      return null;
                    }

                    // ✅ Fix: Process external images inside columns/mediaText
                    if (contentBlock._type === "externalImage") {
                      return await processImages([contentBlock], client);
                    }

                    return contentBlock;
                  })
                )
              )
                .flat() // 🔥 Fix: Flatten nested arrays
                .filter(Boolean); // 🔥 Fix: Remove null values

              return column;
            })
          );
        }
      }
      return block;
    })
  );

  debugLog("✅ Final Processed Blocks", blocks);
  return blocks;
}