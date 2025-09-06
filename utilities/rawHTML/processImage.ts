import { sanityUploadFromUrl } from "../common/sanityUploadFromUrl";
import type { SanityClient } from '@sanity/client';
import pLimit from 'p-limit';

async function fetchContentType(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) return null;
    return res.headers.get('content-type');
  } catch (err) {
    console.warn(`❌ Failed HEAD request for: ${url}`, err);
    return null;
  }
}

async function isImageAccessible(url: string): Promise<boolean> {
  const contentType = await fetchContentType(url);
  if (!contentType) {
    console.warn(`⚠️ No content type for ${url}`);
    return false;
  }
  if (!contentType.startsWith("image/")) {
    console.warn(`⚠️ Invalid MIME type (${contentType}): ${url}`);
    return false;
  }
  return true;
}

export async function processImages(blocks: any[], client: SanityClient) {
  if (!client) {
    throw new Error("❌ Sanity Client is not defined! Make sure you pass it correctly.");
  }

  const limit = pLimit(2);

  const uploadAndAssign = async (
    target: any,
    url: string,
    parentBlock?: { _type: string }
  ) => {
    const contentType = await fetchContentType(url);
    const isSVG = contentType === "image/svg+xml";

    if (!contentType?.startsWith("image/")) {
      console.warn(`⚠️ Skipping non-image URL (${contentType}): ${url}`);
      return;
    }

    const imageDoc = await sanityUploadFromUrl(url, client, {
      filename: url.split("/").pop() || "image",
    });

    if (!imageDoc) return;

    const SVG_SUPPORTED_BLOCKS = ['mediaText', 'inlineImage'] as const;

    // ✅ Special handling if the parent block is mediaText
    if (SVG_SUPPORTED_BLOCKS.includes(parentBlock?._type)) {
      if (isSVG) {
        target.svg = {
          _type: 'file',
          asset: {
            _ref: imageDoc._id,
            _type: 'reference',
          },
        };
      } else {
        // flat style
        target.imageAssets.asset = {
          _ref: imageDoc._id,
          _type: 'reference',
        };
      }
    } else {
      // ✅ Default behavior for externalImage or inlineImage
      target.asset = {
        _ref: imageDoc._id,
        _type: 'reference',
      };
    }

    delete target.url;
    console.log(
      `✅ Uploaded ${isSVG ? 'SVG' : 'Image'} for ${parentBlock?._type || 'unknown'}: ${imageDoc._id}`
    );
  };


  const inlineImageProcessor = async (children: any[]) => {
    for (const child of children) {
      if (
        child._type === "inlineImage" &&
        child.imageAssets &&
        !child.imageAssets.asset?._ref &&
        (child.imageAssets.url || child.imageAssets.svg?.url)
      ) {
        const imageUrl =
          child.imageAssets.url || child.imageAssets.svg?.url;

        if (!imageUrl) continue;

        const contentType = await fetchContentType(imageUrl);
        const isSVG = contentType === "image/svg+xml";

        const imageDoc = await sanityUploadFromUrl(imageUrl, client, {
          filename: imageUrl.split('/').pop() || 'inline-image',
        });

        if (imageDoc) {
          if (isSVG) {
            child.imageAssets.svg = {
              _type: 'file',
              asset: {
                _ref: imageDoc._id,
                _type: 'reference',
              },
            };
            delete child.imageAssets.url;
          } else {
            child.imageAssets.imageAssets.asset = {
              _ref: imageDoc._id,
              _type: 'reference',
            };
            delete child.imageAssets.url;
          }

          console.log(`✅ Inline ${isSVG ? 'SVG' : 'image'} uploaded: ${imageDoc._id}`);
        }
      }
    }
  };

  const shouldUploadImage = (block: any): boolean => {
    const img = block?.imageAssets;

    const hasUrl =
      img?.url ||
      img?.imageAssets?.url || // nested structure
      img?.svg?.url;

    const hasRef =
      img?.asset?._ref ||
      img?.imageAssets?.asset?._ref || // nested image reference
      img?.svg?.asset?._ref;

    return Boolean(img && hasUrl && !hasRef);
  };


  const processBlock = async (block: any): Promise<any | null> => {
    console.warn("🔍 Processing block:", block._type);

    if (
      ['externalImage', 'inlineImage', 'mediaText'].includes(block._type) &&
      shouldUploadImage(block)
    ) {
      const url =
        block.imageAssets?.url ||
        block.imageAssets?.imageAssets?.url ||
        block.imageAssets?.svg?.url;

      await uploadAndAssign(block.imageAssets, url, block); // ✅ pass block for condition
    }

    // ✅ Handle SVGs (block.svg.url -> upload -> block.svg.asset._ref)
    if (
      block._type === 'externalImage' &&
      block.svg?.url &&
      !block.svg.asset?._ref
    ) {
      await uploadAndAssign(block.svg, block.svg.url);
    }

    // ✅ Inline images
    if (Array.isArray(block.children)) {
      await inlineImageProcessor(block.children);
    }

    // ✅ mediaText.content[].children
    if (block._type === 'mediaText' && Array.isArray(block.content)) {
      for (const contentBlock of block.content) {
        if (Array.isArray(contentBlock.children)) {
          await inlineImageProcessor(contentBlock.children);
        }
      }
    }

    // ✅ columns[].content[]
    if (block._type === 'columns' && Array.isArray(block.columns)) {
      for (const column of block.columns) {
        if (Array.isArray(column.content)) {
          column.content = await processImages(column.content, client);
        }
      }
    }

    // ✅ tabs[].content[]
    if (block._type === 'tabs' && Array.isArray(block.tabs)) {
      for (const tab of block.tabs) {
        if (Array.isArray(tab.content)) {
          tab.content = await processImages(tab.content, client);
        }
      }
    }

    // ✅ gallerys[].imageAssets and externalImage.imageAssets
    if (block._type === 'gallerys' && Array.isArray(block.gallerys)) {
      for (const gallery of block.gallerys) {
        if (gallery._type === 'gallery' && gallery.mediaType === 'image') {
          const sources = [
            gallery.imageAssets,
            gallery.externalImage?.imageAssets,
            gallery.externalImage?.svg,
          ];

          for (const source of sources) {
            if (source?.url && !source.asset?._ref) {
              await uploadAndAssign(source, source.url);
            }
          }
        }
      }
    }

    // ✅ productBlock.products[].imageAssets and brand.logo.svg
    if (block._type === 'productBlock' && Array.isArray(block.products)) {
      for (const product of block.products) {
        const sources = [
          product?.image?.imageAssets,
          product?.brand?.logo?.imageAssets,
          product?.brand?.logo?.svg,
        ];

        for (const source of sources) {
          if (source?.url && !source.asset?._ref) {
            await uploadAndAssign(source, source.url);
          }
        }
      }
    }

    return block;
  };

  const results = await Promise.all(
    blocks.map((block) => limit(() => processBlock(block)))
  );

  return results.filter(Boolean);
}
