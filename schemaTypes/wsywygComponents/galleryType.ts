import { defineField, defineType } from 'sanity'

export const galleryType = defineType({
  name: 'gallery',
  type: 'object',
  fields: [   
    defineField({
      name: 'mediaType',
      type: 'string',
      title: 'Media Type',
      options: {
        list: [
          { title: 'YouTube', value: 'youtube' },
          { title: 'Image', value: 'image' },
        ],
        layout: 'radio',       
        direction: 'horizontal' 
      },
    }),
    defineField({
      name: 'youtubeId',
      type: 'string',
      title: 'YouTube ID',
      hidden: ({ parent }) => parent?.mediaType !== 'youtube'     
    }),
    defineField({
      name: 'externalImage',
      type: 'externalImage', // assumes this is a custom object type you already defined
      hidden: ({ parent }) => parent?.mediaType !== 'image',
    })    
  ],
  preview: {
    select: {
        mediaType: 'mediaType',
    },
    prepare({ mediaType }) {
        return {
            title: mediaType === 'youtube' ? '🎥 YouTube Video' : '🖼️ Image',
        }
    }
  },
})
