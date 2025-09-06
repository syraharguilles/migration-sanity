import {defineType, defineField} from 'sanity';

export const externalImageType = defineType({
  name: 'externalImage',
  title: 'External Image',
  type: 'object',
  fields: [
    defineField({
      name: 'imageAssets',
      title: 'Image Asset',
      type: 'image', // Sanity's built-in image type
    }),    
    defineField({
      name: 'svg',
      type: 'file',
      options: {
        accept: 'image/svg+xml',
      },
    }),
    defineField({
      name: 'url',
      title: 'Image URL',
      type: 'url', // Fallback for external image URLs
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string', // Fallback for external image URLs
    }),
    defineField({
      name: 'alt',
      title: 'Alternative Text',
      type: 'string', // Fallback for external image URLs
    }),
  ],
  preview: {
    select: {
      imageUrl: 'imageAssets.asset->url', // Fetch the Sanity-hosted image URL
      externalUrl: 'url', // Fetch the external fallback URL
    },
    prepare(selection) {
      const {imageUrl, externalUrl} = selection;
      return {
        title: 'External Image',
        subtitle: externalUrl ? 'Using external URL' : 'Using uploaded asset',
        media: imageUrl || externalUrl ? {url: imageUrl || externalUrl} : undefined,
      };
    },
  },
});
