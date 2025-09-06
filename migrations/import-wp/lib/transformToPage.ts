import {decode} from 'html-entities'
import type {WP_REST_API_Post} from 'wp-types'

import type {Page} from '../../../sanity.types'

// Remove these keys because they'll be created by Content Lake
type StagedPage = Omit<Page, '_createdAt' | '_updatedAt' | '_rev'>

export async function transformToPage(wpDoc: WP_REST_API_Post): Promise<StagedPage> {
  const doc: StagedPage = {
    _id: `Page-${wpDoc.id}`,
    _type: 'page',
  }

  doc.title = decode(wpDoc.title.rendered).trim()
  
  return doc
}