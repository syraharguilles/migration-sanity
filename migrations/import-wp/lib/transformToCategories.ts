import {decode} from 'html-entities'
import type {WP_REST_API_Term} from 'wp-types'
import {htmlToBlockContent} from './htmlToBlockContent'
import type {Term} from '../../../sanity.types'
import type {SanityClient} from 'sanity'
import {sanityIdToImageReference} from './sanityIdToImageReferences'
import {sanityUploadFromUrl} from '../../../utilities/common/sanityUploadFromUrl'
import {wpImageFetch} from './wpImageFetch'

// Remove these keys because they'll be created by Content Lake
type StagedTerm = Omit<Term, '_createdAt' | '_updatedAt' | '_rev'>

export async function transformToCategories(
  wpDoc: WP_REST_API_Term,
  client: SanityClient,
  existingImages: Record<string, string> = {},
): Promise<StagedTerm> {
  const doc: StagedTerm = {
    _id: `category-${wpDoc.id}`,
    _type: 'category',
  }

  doc.name = wpDoc.name
  doc.slug = {current: wpDoc.slug}

  if (wpDoc.description) {
    doc.content = await htmlToBlockContent(wpDoc.description, client, existingImages)
  }

  return doc
}