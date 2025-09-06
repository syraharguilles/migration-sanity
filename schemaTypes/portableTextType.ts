import {defineField, defineType} from 'sanity';

export const portableTextType = defineField({
  name: 'portableText',
  type: 'array',
  of: [   
    {type: 'image'},
    {type: 'externalImage'}, // External images
    {type: 'columns'}, // Add support for columns
    {type: 'mediaText'}, // Add support for Media and Text
    {type: 'tableType'}, // Add support for Table
    {type: 'tabs'}, // Add support for Table
    {type: 'htmlEmbed'}, // Add support for htmlRawEmbed
    {type: 'horizontalRule' },
    {type: 'productBlock'},
    { type: 'gallerys'},
    { 
      type: 'block',
      of: [{ type: 'inlineImage' }],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Underline', value: 'underline' },
          { title: 'Strikethrough', value: 'strike-through' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
              },
              {
                name: 'title',
                type: 'string',
                title: 'Title (optional)',
              },
              {
                name: 'target',
                type: 'string',
                title: 'Target',
                options: {
                  list: [
                    { title: 'Same tab', value: '_self' },
                    { title: 'New tab', value: '_blank' },
                  ],
                  layout: 'radio',
                  direction: 'horizontal',
                },
              },
            ],
          },
          {
            name: 'paragraphClass',
            type: 'object',
            title: 'Paragraph Class',
            icon: () => '🎨',
            fields: [
              {
                name: 'className',
                type: 'string',
                title: 'CSS Class Name',
                description: 'Enter a custom class name for the selected text.',
              },
            ],
          },
        ],
      }
    }
  ],
});
