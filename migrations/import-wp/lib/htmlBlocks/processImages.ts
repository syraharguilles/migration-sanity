import pLimit from "p-limit";
import { processExternalImage } from "./externalImage";
import type { SanityClient } from "sanity";

export async function processImages(blocks: any[], client: SanityClient) {
  if (!client) {
    throw new Error("❌ Sanity Client is not defined! Make sure you pass it correctly.");
  }

  const limit = pLimit(2);
  return await Promise.all(
    blocks.map((block) =>
      limit(async () => {
        if (block._type === "externalImage") {
          return await processExternalImage(block, client);
        }
        return block;
      })
    )
  );
}
