import {ComposeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'
import {ContentWithConvertButton } from '../components/ContentWithConvertButton'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^\w\-]+/g, '') // Remove non-word chars
            .replace(/\-\-+/g, '-') // Collapse multiple -
            .replace(/^-+/, '') // Trim - from start
            .replace(/-+$/, '') // Trim - from end
      }
    }),
    defineField({name: 'date', type: 'datetime'}),
    defineField({name: 'modified', type: 'datetime'}),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          {title: 'Published', value: 'publish'},
          {title: 'Future', value: 'future'},
          {title: 'Draft', value: 'draft'},
          {title: 'Pending', value: 'pending'},
          {title: 'Private', value: 'private'},
          {title: 'Trash', value: 'trash'},
          {title: 'Auto-Draft', value: 'auto-draft'},
          {title: 'Inherit', value: 'inherit'},
        ],
      },
    }),
    defineField({
      name: 'rawHtml',
      title: 'Raw HTML',
      type: 'text',
    }),   
    defineField({
      name: 'content',
      type: 'portableText',
      title: 'Converted Content',
      components: {
        input: ContentWithConvertButton,
      },
    }),  
    defineField({
      name: 'excerpt',
      type: 'text',
    }),
    defineField({name: 'featuredMedia', type: 'image'}),
    defineField({name: 'sticky', type: 'boolean'}),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'author'}],
    }),
    defineField({
      name: 'categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'tag'}]}],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'author.name',
      media: 'featuredMedia',
      content: 'content', // assuming 'content' is the converted field
    },
    prepare({title, subtitle, media, content}) {
      const isConverted = Array.isArray(content) && content.length > 0
      const status = isConverted ? '✅ Converted' : '❌ Not converted'

      return {
        title,
        subtitle: `${subtitle} – ${status}`,
        media,
      }
    },
  }
})