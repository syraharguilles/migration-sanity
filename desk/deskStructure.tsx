// sanity/desk/deskStructure.ts
import {StructureBuilder} from 'sanity/structure'
import {DocumentListPaneWithButton} from '../components/DocumentListPaneWithButton'

const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      ...S.documentTypeListItems()
    ])


export default deskStructure
