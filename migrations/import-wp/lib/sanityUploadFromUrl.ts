import { Readable } from "node:stream";
import type { SanityClient, SanityImageAssetDocument, UploadClientConfig } from "@sanity/client";

export async function sanityUploadFromUrl(
  url: string,
  client: SanityClient,
  metadata: UploadClientConfig
): Promise<SanityImageAssetDocument | null> {
  console.log("📤 Uploading Image:", url);

  const { body } = await fetch(url);
  if (!body) {
    console.error(`❌ No body found for ${url}`);
    return null;
  }

  try {
    const data = await client.assets.upload("image", Readable.fromWeb(body), metadata);
    console.log("✅ Image Uploaded:", data._id);
    return data; // ✅ Return the uploaded image document with _id
  } catch (error) {
    console.error(`🚨 Failed to upload image from ${url}`);
    console.error("upload error: ", error);
    return null;
  }
}
