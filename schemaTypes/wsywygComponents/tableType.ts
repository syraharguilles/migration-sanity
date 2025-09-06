import { FilterIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

// Define once
export const tableRowField = defineType({
  name: 'row',
  type: 'object',
  fields: [
    defineField({
      name: 'cells',
      type: 'array',
      of: [
        defineType({
          name: 'cell',
          type: 'object',
          fields: [
            defineField({
              name: 'content',
              type: 'array',
              of: [
                {
                  type: 'block',
                  styles: [],
                  marks: {
                    decorators: [
                      { title: 'Bold', value: 'strong' },
                      { title: 'Italic', value: 'em' },
                      { title: 'Underline', value: 'underline' },
                    ],
                    annotations: [
                      {
                        name: 'link',
                        type: 'object',
                        fields: [
                          { name: 'href', type: 'url', title: 'URL' },
                          {
                            name: 'target',
                            type: 'string',
                            options: {
                              list: [
                                { title: 'Same tab', value: '_self' },
                                { title: 'New tab', value: '_blank' },
                              ],
                            },
                          },
                          { name: 'Title', type: 'string', title: 'Title' },
                        ],
                      },
                    ],
                  },
                },
              ],
            }),
            defineField({ name: 'colspan', type: 'number', initialValue: 1 }),
            defineField({ name: 'rowspan', type: 'number', initialValue: 1 }),
          ],
        }),
      ],
    }),
  ],
});

export const tableType = defineType({
    name: "tableType",
    title: "Table",
    type: "document",
    icon: FilterIcon,
    fields: [
        defineField({
            name: "title",
            title: "Table Title",
            type: "string"          
        }),
        defineField({
            name: "headerRow",
            title: "Table Header Row",
            type: "array",
            of: [tableRowField]
        }),
        defineField({
            name: 'rows',
            title: 'Table Rows',
            type: 'array',
            of: [tableRowField]
        }),
          
        defineField({
            name: "footerRow",
            title: "Table Footer Row",
            type: "array",
            of: [tableRowField]
        }),
    ],
    preview: {
        prepare() {
        return {
            title: 'Table',
            subtitle: 'Custom table with rows and cells',
        }
        },
    },
});