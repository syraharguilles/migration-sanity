import {defineField, defineType} from 'sanity'

export const tabType = defineType({
  name: 'tab',
  type: 'object',
  fields: [
    defineField({
        name: 'title',
        type: 'string',
      }),
    defineField({
      name: 'content',
      type: 'portableText',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || '📝 Untitled Tab',
      }
    },
  },
})