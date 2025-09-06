import {defineField, defineType} from 'sanity'

export const gallerysType = defineType({
  name: 'gallerys',
  type: 'object',
  fields: [
    defineField({
      name: 'gallerys',
      type: 'array',
      of: [{type: 'gallery'}],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Gallery',
      };
    },
  },
})