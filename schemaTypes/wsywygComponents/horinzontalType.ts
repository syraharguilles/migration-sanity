import { defineType, defineField } from 'sanity'

export const hrType = defineType({
  name: 'horizontalRule',
  type: 'object',
  title: 'Horizontal Rule',
  fields: [
    defineField({
      name: 'hidden',
      type: 'string',
      hidden: true,
      initialValue: 'hr'
    })
  ],
  preview: {
    prepare() {
      return {
        title: 'Horizontal Rule',
      }
    },
  },
})
