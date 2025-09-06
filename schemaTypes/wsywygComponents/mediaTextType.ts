import { defineType, defineField } from 'sanity';

export const mediaTextType =  defineType({
  name: 'mediaText',
  title: 'Media and Text',
  type: 'object',
  fields: [
    defineField({
        name: 'imageAssets',
        title: 'Image Asset',
        type: 'externalImage', // Sanity's built-in image type
    }),    
    defineField({
      name: 'imagePosition',
      title: 'Image Position',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
        direction: "horizontal",
      },
      initialValue: 'left',
    }),
    defineField({
      name: 'verticalAlignment',
      title: 'Vertical Alignment',
      type: 'string',
      options: {
        list: [
          { title: 'Top', value: 'top' },
          { title: 'Center', value: 'center' },
          { title: 'Bottom', value: 'bottom' },
        ],
        layout: 'radio',
        direction: "horizontal",
      },
      initialValue: 'center',
    }),
    defineField({
        name: 'content',
        title: 'Content',
        type: 'portableText'       
    }),
    
  ],
  preview: {
    select: {
      title: 'alt',
      subtitle: 'imagePosition',
      media: 'media',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: 'Media and Text',
        subtitle: `Image Position: ${subtitle}`,
        media,
      };
    },
  },
});
