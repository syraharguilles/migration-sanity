import { defineType, defineField } from 'sanity'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Product Name', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'sku', title: 'SKU', type: 'string' }),
    defineField({
      name: 'productType',
      title: 'Product Type',
      type: 'string',
      options: {
        list: [
          { title: 'Simple', value: 'simple' },
          { title: 'Variable', value: 'variable' },
          { title: 'Grouped', value: 'grouped' },
          { title: 'External/Affiliate', value: 'external' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({ name: 'price', title: 'Price', type: 'number' }),
    defineField({ name: 'salePrice', title: 'Sale Price', type: 'number' }),
    defineField({ name: 'inStock', title: 'In Stock', type: 'boolean', initialValue: true }),
    defineField({ name: 'shortDescription', title: 'Short Description', type: 'text' }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
    defineField({name: 'featuredMedia', type: 'image'}),
    defineField({
      name: 'images_thumnails',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
  ],
})
