import { htmlToBlocks } from '@sanity/block-tools'
import {getPortableTextRules} from '../modules/htmlToBlocksCore'

export function htmlToBlockContent(html: string, blockContentSchema: any): any[] {
    let blocks = htmlToBlocks(html, blockContentSchema, {
      rules: getPortableTextRules()
    });
  
    // ✅ Add validation/debug log here
    blocks.forEach((block, i) => {
      if (!block._type) {
        console.warn(`⚠️ Block at index ${i} is missing _type`, block);
      }
  
      if (block.children) {
        block.children.forEach((child, j) => {
          if (!child._type) {
            console.warn(`⚠️ Child at block[${i}].children[${j}] is missing _type`, child);
          }
        });
      }
    });
  
    return blocks;
  }
  