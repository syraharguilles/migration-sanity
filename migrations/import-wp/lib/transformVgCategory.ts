import {decode} from 'html-entities'
import type {WP_REST_API_VG_Category} from '../types/WP_REST_API_VG_Category'
import {htmlToBlockContent} from './htmlToBlockContent'
import type {vgCategory} from '../../../sanity.types'
import type {SanityClient} from 'sanity'


// Remove these keys because they'll be created by Content Lake
type StagedVgCategory = Omit<vgCategory, '_createdAt' | '_updatedAt' | '_rev'>

export async function transformVgCategory(
  wpDoc: WP_REST_API_VG_Category,
  client: SanityClient,
  existingImages: Record<string, string> = {},
): Promise<StagedVgCategory> {
  const doc: StagedVgCategory = {
    _id: `vg-category-${wpDoc.id}`,
    _type: 'vg-category',
  }

  doc.name = wpDoc.name
  doc.slug = {current: wpDoc.slug}

  if (wpDoc.description) {
    doc.content = await htmlToBlockContent(wpDoc.description, client, existingImages)
  }

  if (wpDoc.parent && wpDoc.parent > 0) {
    doc.parent = {
      _type: 'reference',
      _ref: `vg-category-${wpDoc.parent}`, // Reference the parent category by ID
    };
  } else {
    doc.parent = null; // No parent
  }

  return doc
}           