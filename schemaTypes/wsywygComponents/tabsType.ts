import {defineField, defineType} from 'sanity'

export const tabsType = defineType({
  name: 'tabs',
  type: 'object',
  fields: [
    defineField({
      name: 'tabs',
      type: 'array',
      of: [{type: 'tab'}],
    }),
  ],
  preview: {
    select: {
      tabs: 'tabs',
    },
    prepare({tabs}) {
      const tabssCount = tabs.length
      return {
        title: 'Tabs',
      }
    },
  },
})