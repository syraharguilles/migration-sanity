import { Buffer } from 'buffer'
import type { SanityDocumentLike } from 'sanity'
import { createClient } from '@sanity/client'
import pLimit from 'p-limit'
import { createOrReplace, defineMigration } from 'sanity/migrate'
import type {
  WP_REST_API_Post,
  WP_REST_API_Term,
  WP_REST_API_User
} from 'wp-types'

import type {
  WP_REST_API_Brands,
  WP_REST_API_Vehicle_Guides,
  WP_REST_API_VG_Category
} from './types'

import { chunkArray, countAttributes, getMaxDepth, createSmartBatches } from '../../utilities/default/utils'

import { getDataTypes } from './lib/getDataTypes'
import { transformToPost } from './lib/transformToPost'
import { transformToPage } from './lib/transformToPage'
import { transformToCategories } from './lib/transformToCategories'
import { transformToBrands } from './lib/transformToBrands'
import { transformVgCategory } from './lib/transformVgCategory'
import { transformToUsers } from './lib/transformToUsers'
import { transformToTags } from './lib/transformToTags'
import { wpDataTypeFetch } from './lib/wpDataTypeFetch'

import { sanityFetchImages } from './lib/sanityFetchImages'
import { transformToVehicleGuides } from './lib/transformToVehicleGuides'

const limit = pLimit(5)

export default defineMigration({
  title: 'Import WP JSON data',

  async *migrate(docs, context) {
    const client = createClient(context.client.config())
    const existingImages = await sanityFetchImages(client)

    const { wpType } = getDataTypes(process.argv)
    let page = 1
    let hasMore = true
    let totalYielded = 0
    let skippedCount = 0

    while (hasMore) {
      try {
        let wpData = await wpDataTypeFetch(wpType, page)

        // ✅ Add this log right after fetching the data
        console.log(`📥 Fetched ${wpData.length} items on page ${page}`);

        if (Array.isArray(wpData) && wpData.length) {
          const docs = wpData.map((wpDoc) =>
            limit(async () => {
              let doc
              try {
                switch (wpType) {
                  case 'posts':
                    doc = await transformToPost(wpDoc as WP_REST_API_Post, client, existingImages)
                    break
                  case 'pages':
                    doc = await transformToPage(wpDoc as WP_REST_API_Post)
                    break
                  case 'categories':
                    doc = await transformToCategories(wpDoc as WP_REST_API_Term, client)
                    break
                  case 'tags':
                    doc = await transformToTags(wpDoc as WP_REST_API_Term)
                    break
                  case 'users':
                    doc = await transformToUsers(wpDoc as WP_REST_API_User)
                    break
                  case 'brands':
                    doc = await transformToBrands(wpDoc as WP_REST_API_Brands, client, existingImages)
                    break
                  case 'vehicle-guides':
                    doc = await transformToVehicleGuides(wpDoc as WP_REST_API_Vehicle_Guides, client, existingImages)
                    break
                  case 'vg-category':
                    doc = await transformVgCategory(wpDoc as WP_REST_API_VG_Category)
                    break
                  default:
                    throw new Error(`Unhandled WordPress type: ${wpType}`)
                }

                if (!doc || !doc._id || !doc._type) {
                  console.warn(`⚠️ Skipping malformed doc for ID ${wpDoc.id}`)
                  skippedCount++
                  return null
                }

                return doc
              } catch (err) {
                console.error(`❌ Error transforming post ${wpDoc.id}:`, err)
                skippedCount++
                return null
              }
            })
          )

          const resolvedDocs = await Promise.all(docs)

          const validDocs = resolvedDocs.filter((doc) => {
            if (!doc || !doc._id || !doc._type) {
              skippedCount++
              return false
            }

            const sizeBytes = Buffer.byteLength(JSON.stringify(doc))
            const attrCount = countAttributes(doc)
            const maxDepth = getMaxDepth(doc)

            let sizeDisplay = ''
            if (sizeBytes > 1024 * 1024) {
              sizeDisplay = `${(sizeBytes / 1024 / 1024).toFixed(2)} MB`
            } else if (sizeBytes > 1024) {
              sizeDisplay = `${(sizeBytes / 1024).toFixed(2)} KB`
            } else {
              sizeDisplay = `${sizeBytes} B`
            }

            if (attrCount > 950) {
              console.warn(`⚠️ Attribute Count: ${attrCount} — ID: ${doc._id}`)
            }

            if (maxDepth > 15) {
              console.warn(`🔍 Deep Nesting: ${maxDepth} levels — ID: ${doc._id}`)
            }

            console.log(`📄 Doc ${doc._id} — Size: ${sizeDisplay} | Attrs: ${attrCount} | Depth: ${maxDepth}`)
            return true
          })

          if (validDocs.length > 0) {
            const batches = createSmartBatches(validDocs)

            for (const [index, batch] of batches.entries()) {
              const totalSize = batch.reduce((acc, doc) => acc + Buffer.byteLength(JSON.stringify(doc)), 0)

              console.log( `📦 Batch ${index + 1}: ${batch.length} docs — ${(totalSize / 1024).toFixed(2)} KB`)

              const mutations = batch.map(createOrReplace)
              console.log(`⏫ Yielding batch of ${mutations.length} documents...`)
              try {
                yield mutations
                console.log(`✅ Yielded ${mutations.length} docs`)
              } catch (e) {
                console.error(`❌ Failed to yield batch:`, e)
              }
              await new Promise((res) => setTimeout(res, 5000))
            }
            totalYielded += validDocs.length
          } else {
            yield []
          }

          page++
        } else {
          hasMore = false
        }
      } catch (error) {
        console.error(`Error fetching data for page ${page}:`, error)
        hasMore = false
      }
    }

    if (totalYielded === 0) {
      console.warn('⚠️ No documents found or yielded — sending empty mutation to satisfy migration contract.')
      yield []
    } else {
      console.log(`✅ Migration complete. Total documents imported: ${totalYielded}`)
      if (skippedCount > 0) {
        console.warn(`🚫 Skipped ${skippedCount} documents due to validation or transformation issues.`)
      }
    }
  }
})
