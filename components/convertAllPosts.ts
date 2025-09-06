import type { SanityClient } from 'sanity'
import { htmlToBlockContent } from '../components/ProcessSanityHTMLtoBlock'
import { Schema } from "@sanity/schema"
import { schemaTypes } from "../schemaTypes"
import { processImages } from '../utilities/rawHTML/processImage'
import { cleanColumns } from '../utilities/rawHTML/cleaners'

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

export async function convertAllPosts(
  client: SanityClient,
  progressCallback?: (current: number, total: number) => void
): Promise<{ successCount: number; failed: { _id: string; error: string }[] }> {
  const posts = await client.fetch(`*[_type == "post" && content == null]{ _id, rawHtml }`)
  const total = posts.length
  let completed = 0
  const failed: { _id: string; error: string }[] = []
  let successCount = 0

  if (total === 0) {
    progressCallback?.(0, 0)
    return { successCount, failed }
  }

  const compiledSchema = Schema.compile({ types: schemaTypes })
  const blockContentSchema = compiledSchema.get('post')?.fields.find(f => f.name === 'content')?.type

  if (!blockContentSchema) {
    failed.push({ _id: 'schema', error: 'Missing schema for post.content' })
    progressCallback?.(0, total)
    return { successCount, failed }
  }

  for (const post of posts) {
    try {
      let blocks = await htmlToBlockContent(post.rawHtml, blockContentSchema)
      blocks = await processImages(blocks, client)

      blocks = blocks.map((block) => {
        if (block._type === 'columns' && Array.isArray(block.columns)) {
          return {
            ...block,
            columns: cleanColumns(block.columns),
          };
        }

        // // ✅ productBlock products[].image and brand.logo cleanup
        if (block._type === 'productBlock' && Array.isArray(block.products)) {    
          block.products.forEach((product) => {
            console.log( product.externalImage.imageAssets );
            if (
              product.externalImage?.imageAssets &&
              !product.externalImage?.imageAssets?.asset?._ref
            ) {
              delete product.externalImage.imageAssets;
            }
            console.log( product.brand.logo );
            if (
              product.brand?.logo?.imageAssets &&
              !product.brand.logo.imageAssets.asset?._ref
            ) {
              delete product.brand.logo.imageAssets;
            }
          });
        }
  
        // Clean columns inside tabs
        if (block._type === 'tabs' && Array.isArray(block.tabs)) {
          const cleanedTabs = block.tabs.map((tab) => {
            if (!Array.isArray(tab.content)) return tab;
  
            const cleanedContent = tab.content.map((nestedBlock) => {
              if (nestedBlock._type === 'columns' && Array.isArray(nestedBlock.columns)) {
                return {
                  ...nestedBlock,
                  columns: cleanColumns(nestedBlock.columns),
                };
              }
              return nestedBlock;
            });
  
            return {
              ...tab,
              content: cleanedContent,
            };
          });
  
          return {
            ...block,
            tabs: cleanedTabs,
          };
        }        

        return block;
      });

      await client.patch(post._id).set({ content: blocks }).commit()
      successCount++
    } catch (err: any) {
      failed.push({ _id: post._id, error: err?.message || 'Unknown error' })
    }

    completed++
    progressCallback?.(completed, total)
  }

  return { successCount, failed }
}

