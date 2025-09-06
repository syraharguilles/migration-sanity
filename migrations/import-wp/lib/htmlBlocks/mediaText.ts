import { uuid } from "@sanity/uuid";
import { sanityUploadFromUrl } from "../../../../utilities/common/sanityUploadFromUrl"; // Ensure you have this function
import type { SanityClient } from "sanity";

export async function parseMediaTextBlock(node: HTMLElement, next: any, block: any, client: SanityClient) {

  if (!client) {
    throw new Error("❌ Sanity Client is not defined! Make sure you pass it correctly.");
  }

  const imgEl = node.querySelector("figure img");
  const contentEl = node.querySelector(".wp-block-media-text__content");

  const imageUrl = imgEl?.getAttribute("src") || null;
  const textBlocks = contentEl ? next(contentEl.childNodes) : [];

  // ✅ Ensure content has the correct structure
  const formattedContent = textBlocks.map((block) => ({
    _key: block._key || uuid(),
    _type: "block",
    children: block.children || [],
    markDefs: block.markDefs || [],
    style: block.style || "normal",
  }));

  let imageAsset = null;

  if (imageUrl) {

    try {
      const imageDocument = await sanityUploadFromUrl(imageUrl, client, {
        filename: imageUrl.split("/").pop() || "image",
      });

      if (imageDocument) {
        imageAsset = {
          _type: "externalImage",
          asset: { _type: "reference", _ref: imageDocument._id }, // ✅ Ensure _ref is assigned
        };
      } else {
        console.warn("❌ Image Upload Failed for mediaText:", imageUrl);
      }
    } catch (error) {
      console.error("❌ Error uploading mediaText image:", error);
    }
  }

  return block({
    _type: "mediaText",
    _key: uuid(),
    content: formattedContent,
    imageAssets: imageAsset, // ✅ Properly set the imageAsset reference
    imagePosition: node.classList.contains("has-media-on-the-right") ? "right" : "left",
    verticalAlignment: node.classList.contains("is-vertically-aligned-top")
      ? "top"
      : node.classList.contains("is-vertically-aligned-bottom")
      ? "bottom"
      : "center",
  });
}
