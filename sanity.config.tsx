import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

import {CustomStudioLayout} from './desk/CustomStudioLayout'
import deskStructure from './desk/deskStructure'


export default defineConfig({
  name: 'default',
  title: 'Sanity WordPress',

  projectId: 'zpfh5d8a',
  dataset: 'bimmers',

  plugins: [
    structureTool({
      structure: deskStructure
    }),
    visionTool()],
  schema: {
    types: schemaTypes,
  },
  studio: {
    components: {
      activeToolLayout: CustomStudioLayout,
    },
  },
  
})
