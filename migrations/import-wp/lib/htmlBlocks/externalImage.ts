import { sanityUploadFromUrl } from "../../../../utilities/common/sanityUploadFromUrl";
import type { SanityClient } from "sanity";
import { logFailedImage } from "../imageLogger"; // Import logging utility

export async function processExternalImage(block: any, client: SanityClient) {
  if (!block.imageAssets || !block.imageAssets.url) {
    console.warn("⚠️ Skipping: No image URL found in block.");
    return block;
  }

  if (!block.imageAssets.asset._ref) {
    try {
      // Extract filename from URL
      const filename = block.imageAssets.url.split("/").pop() || "image";

      // Attempt to upload the image
      const imageDocument = await sanityUploadFromUrl(block.imageAssets.url, client, { filename });

      if (imageDocument) {
        block.imageAssets.asset._ref = imageDocument._id;
        delete block.imageAssets.url;
        console.log("✅ Updated Image _ref:", block.imageAssets.asset._ref);
      } else {
        throw new Error("Sanity upload failed");
      }
    } catch (error) {
      console.warn("❌ Image Upload Failed:", block.imageAssets.url, error.message);

      // Log failed images separately
      logFailedImage({
        imageUrl: block.imageAssets.url,
        reason: "Failed to upload to Sanity",
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
      });

      // Remove the broken image reference but keep the block
      delete block.imageAssets.url;
    }
  }

  return block;
}
