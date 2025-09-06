import { defineType, defineField } from "sanity";

export const metaTags = defineType({
  name: "metaTags",
  title: "Meta Tags",
  type: "object",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
      description: "The title displayed in search results (Max: 60 characters).",   
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      description: "A short description for SEO (Max: 160 characters).",
    }),
    defineField({
      name: "metaImage",
      title: "Meta Image",
      type: "image",
      options: { hotspot: true },
      description: "Image displayed in social shares (Recommended: 1200x630px).",
    }),
    defineField({
      name: "metaKeywords",
      title: "Meta Keywords",
      type: "array",
      of: [{ type: "string" }],
      description: "A list of keywords for SEO (optional).",
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL",
      type: "url",
      description: "The preferred URL for this page to avoid duplicate content issues.",
    }),
  ],
});
