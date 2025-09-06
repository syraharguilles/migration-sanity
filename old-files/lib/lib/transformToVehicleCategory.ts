import {decode} from 'html-entities'
import type {WP_REST_API_Vehicle_Category} from '../types/WP_REST_API_Vehicle_Category'
import {htmlToBlockContent} from './htmlToBlockContent'
import type {vehicleCategory} from '../../../sanity.types'
import type {SanityClient} from 'sanity'


// Remove these keys because they'll be created by Content Lake
type StagedVehicleCategory = Omit<vehicleCategory, '_createdAt' | '_updatedAt' | '_rev'>

export async function transformToVehicleCategory(
  wpDoc: WP_REST_API_Vehicle_Category,
  client: SanityClient,
  existingImages: Record<string, string> = {},
): Promise<StagedVehicleCategory> {
  const doc: StagedVehicleCategory = {
    _id: `vehicle-category-${wpDoc.id}`,
    _type: 'vehicle-category',
  }

  doc.name = wpDoc.name
  doc.slug = {current: wpDoc.slug}

  if (wpDoc.description) {
    doc.content = await htmlToBlockContent(wpDoc.description, client, existingImages)
  }

  if (wpDoc.parent && wpDoc.parent > 0) {
    doc.parent = {
      _type: 'reference',
      _ref: `vehicle-category-${wpDoc.parent}`, // Reference the parent category by ID
    };
  } else {
    doc.parent = null; // No parent
  }

  return doc
}           