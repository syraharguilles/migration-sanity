// schemas/blocks/inlineImage.ts
import {defineType, defineField} from 'sanity'

export const inlineImage = defineType({
  name: 'inlineImage',
  type: 'object',
  title: 'Inline Image',
  options: {
    inline: true, // Makes it embeddable within text blocks
  },
  fields: [    
    defineField({
      name: 'imageAssets',
      title: 'Image Asset',
      type: 'externalImage', // your custom image type     
    })    
  ],
  preview: {
    select: {
      media: 'image',
      title: 'alt',
    },
  },
})
