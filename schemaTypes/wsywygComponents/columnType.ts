import {defineField, defineType} from 'sanity'

export const columnType = defineType({
  name: 'column',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      type: 'portableText',
    }),
  ],
  preview: {
    select: {
      // You can select other fields if needed
    },
    prepare() {
      return {
        title: 'Column', // Static title here
      }
    },
  },
})