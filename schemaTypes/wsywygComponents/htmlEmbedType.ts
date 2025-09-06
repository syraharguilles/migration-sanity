import {defineType, defineField} from 'sanity';

export const htmlEmbed = defineType({
  name: 'htmlEmbed',
  title: 'HTML Embed',
  type: 'object',
  fields: [
    {
      name: 'html',
      title: 'Raw HTML',
      type: 'text',
    },
  ],
  preview: {
    select: {
      title: 'html',
    },
    prepare({ title }) {
      return {
        title: 'HTML Embed',
        subtitle: title?.slice(0, 60) || '',
      }
    },
  },
})
