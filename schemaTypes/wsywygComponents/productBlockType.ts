import { defineType, defineField } from 'sanity'

export const productBlockType = defineType({
  name: 'productBlock',
  title: 'Product Block',
  type: 'object',
  fields: [
    defineField({
      name: 'products',
      title: 'Products',
      type: 'array',
      of: [
        {
          name: 'inlineProduct',
          title: 'Product',
          type: 'object',
          fields: [
            defineField({
              name: 'productTitle',
              title: 'Product Title',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
                name: 'brand',
                title: 'Brand',
                type: 'object',
                fields: [
                    {
                        name: 'name',
                        title: 'Brand Name',
                        type: 'string',
                    },
                    {
                        name: 'logo',
                        title: 'Brand Logo',
                        type: 'externalImage',
                    },
                ],
            }),
            defineField({
              name: 'partNumber',
              title: 'Part Number',
              type: 'string',
            }),
            defineField({
              name: 'price',
              title: 'Price',
              type: 'number',
              validation: Rule => Rule.min(0),
            }),
            defineField({
              name: 'buttonLabel',
              title: 'Button Label',
              type: 'string',
            }),
            defineField({
              name: 'buttonLink',
              title: 'Button Link',
              type: 'url',
            }),
            defineField({
                title: "Product Image",
                name: 'externalImage',
                type: 'externalImage',               
            }), 
          ],
          preview: {
            select: {
              title: 'productTitle',
              media: 'image',
            },
            prepare({ title, media }) {
              return {
                title: title ?? 'Untitled Product',
                media,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      products: 'products',
    },
    prepare({ products }) {
      const first = products?.[0]
      const title = first?.productTitle || 'Product Block'
      const count = products?.length > 1 ? ` + ${products.length - 1} more` : ''
      return {
        title: `🛒 ${title}${count}`,
        media: first?.image,
      }
    },
  },
})
