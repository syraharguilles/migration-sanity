import type {htmlToBlocks} from '@portabletext/block-tools'
import {parse} from '@wordpress/block-serialization-default-parser'
import type {SanityClient, TypedObject} from 'sanity'

import {htmlToBlockContent} from './htmlToBlockContent'

export async function serializedHtmlToBlockContent(
  html: string,
  client: SanityClient,
  imageCache: Record<number, string>,
) {
  // Parse content.raw HTML into WordPress blocks
  const parsed = parse(html)

  let blocks: ReturnType<typeof htmlToBlocks> = []

  for (const wpBlock of parsed) {
    // Convert inner HTML to Portable Text blocks
    if (wpBlock.blockName === 'core/paragraph') {
      const block = await htmlToBlockContent(wpBlock.innerHTML, client, imageCache)
      blocks.push(...block)
    } else if (wpBlock.blockName === 'core/columns') {
      const columnBlock = {_type: 'columns', columns: [] as TypedObject[]}
      for (const column of wpBlock.innerBlocks) {
        const columnContent = []
        for (const columnBlock of column.innerBlocks) {
          const content = await htmlToBlockContent(columnBlock.innerHTML, client, imageCache)
          columnContent.push(...content)
        }
        columnBlock.columns.push({
          _type: 'column',
          content: columnContent,
        })
      }
      blocks.push(columnBlock)
    } else if (!wpBlock.blockName) {
      // Do nothing
    } else {
      console.log(`Unhandled block type: ${wpBlock.blockName}`)
    }
  }

  return blocks
}