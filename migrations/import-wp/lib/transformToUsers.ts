import {decode} from 'html-entities'
import type {WP_REST_API_User} from 'wp-types'

import type {User} from '../../../sanity.types'

// Remove these keys because they'll be created by Content Lake
type StagedUser = Omit<User, '_createdAt' | '_updatedAt' | '_rev'>

export async function transformToUsers(wpDoc: WP_REST_API_User): Promise<StagedUser> {
  const doc: StagedUser = {
    _id: `author-${wpDoc.id}`,
    _type: 'author',
  }

  doc.name = wpDoc.name || wpDoc.username
  //doc.email = wpDoc.email
  doc.slug = { current: wpDoc.slug || wpDoc.username }
  doc.description = wpDoc.description || ''
  //doc.avatar = null
  doc.url = wpDoc.url || null

  return doc
}