import {ComposeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const vehicleType = defineType({
  name: 'vehicle',
  title: 'Vehicle',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'name', // Generates slug from the `name` field
        maxLength: 96, // Optional: Limit the length of the slug
      },
      validation: (Rule) => Rule.required(), // Ensure slug is required
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
      name: 'content',
      type: 'portableText',
    }),
    defineField({
      name: 'excerpt',
      type: 'portableText',
    }),
    defineField({name: 'featuredMedia', type: 'image'}),
    defineField({name: 'sticky', type: 'boolean'}),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'author'}],
    }),
    defineField({
      name: 'vehicleCategory',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'vehicle-category'}]}],
    })    
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'author.name',
      media: 'featuredMedia',
    },
  },
})