import { decode } from 'html-entities';
import { sanityUploadFromUrl } from "../common/sanityUploadFromUrl"
import pLimit from "p-limit";
const { logFailedImage } = require('../../migrations/import-wp/lib/imageLog');

let logMessage = {};

export async function isImageAccessible(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
  
      if (!response.ok) {        
        console.warn(`⚠️ Image not accessible (HTTP ${response.status}): ${url}`);
        return false;
      }
  
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        console.warn(`⚠️ Invalid MIME Type (${contentType}): ${url}`);
        return false;
      }
  
      return true;
    } catch (error: unknown) {
      console.error(`❌ Network error checking image: ${url}`, error);
      return false;
    }
}  

/**
 * Sanitize HTML-ish string with escaped characters.
 * @param input - The raw string to clean.
 */
export function sanitizeExcerpt(input: string): string {
    // Decode unicode and HTML entities
    const decoded = decode(input);

    // Strip HTML tags
    const noHtml = decoded.replace(/<[^>]*>/g, '');

    // Remove extra whitespace and return
    return noHtml.trim();
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

export function countAttributes(obj: any, seen = new Set()): number {
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) return 0;
  seen.add(obj);
  let count = 0;
  for (const key in obj) {
    count++;
    count += countAttributes(obj[key], seen);
  }
  return count;
}

export function getMaxDepth(obj: any, currentDepth = 0): number {
  if (obj === null || typeof obj !== 'object') return currentDepth;
  let max = currentDepth;
  for (const key in obj) {
    max = Math.max(max, getMaxDepth(obj[key], currentDepth + 1));
  }
  return max;
}

export function createSmartBatches(docs: any[], maxBatchSizeBytes = 950 * 1024): any[][] {
  const batches: any[][] = []
  let currentBatch: any[] = []
  let currentBatchSize = 0

  for (const doc of docs) {
    const docSize = Buffer.byteLength(JSON.stringify(doc))

    // If adding this doc exceeds the limit, start a new batch
    if (currentBatchSize + docSize > maxBatchSizeBytes) {
      if (currentBatch.length > 0) {
        batches.push(currentBatch)
      }
      currentBatch = [doc]
      currentBatchSize = docSize
    } else {
      currentBatch.push(doc)
      currentBatchSize += docSize
    }
  }

  // Push the final batch
  if (currentBatch.length > 0) {
    batches.push(currentBatch)
  }

  return batches
}

// ✅ Process Image Uploads & Ensure _ref is assigned
export async function processImages(blocks: any[], client: SanityClient) {
  if (!client) {
    throw new Error("❌ Sanity Client is not defined! Make sure you pass it correctly.");
  }

  const limit = pLimit(2);

  return await Promise.all(
    blocks.map((block) =>
      limit(async () => {
        // ✅ Handle both externalImage and mediaText
        if (
          ( 
            block._type === "externalImage" 
            || block._type === "mediaText" 
            || block._type === "columns"
            || block._type === "productBlock"
          ) &&
          block.imageAssets?.url
        ) {

          if (!block.imageAssets.asset._ref) {
            const imageUrl = block.imageAssets.url;

            // ✅ Check if image is accessible and has valid MIME type
            const isValid = await isImageAccessible(imageUrl);
            if (!isValid) {
              console.warn(`🚫 Skipping image due to access or MIME type issue: ${imageUrl}`);
              return null; // ❌ Skip this block entirely
            }

            // ✅ Proceed to upload
            const imageDocument = await sanityUploadFromUrl(imageUrl, client, {
              filename: imageUrl.split("/").pop() || "image",
            });

            if (imageDocument) {
              block.imageAssets.asset._ref = imageDocument._id;
              delete block.imageAssets.url;
            } else {
              console.warn("❌ Image Upload Failed:", imageUrl);
              return null; // ❌ Skip this block if upload failed
            }
          }
        }

        return block;
      })
    )
  ).then((results) =>
    results.filter(
      (block) =>
        block &&
        (!block.imageAssets || block.imageAssets.asset?._ref !== null)
    )
  );
}