import {uuid} from '@sanity/uuid'
import {decode} from 'html-entities'
import type {SanityClient} from 'sanity'
import type {WP_REST_API_Vehicle} from '../types/WP_REST_API_Vehicle'
import type {Vehicle} from '../../../sanity.types'
import {htmlToBlockContent} from './htmlToBlockContent'
import {sanityIdToImageReference} from './sanityIdToImageReferences'
import {sanityUploadFromUrl} from './sanityUploadFromUrl'
import {wpImageFetch} from './wpImageFetch'

// Remove these keys because they'll be created by Content Lake
type StagedVehicle = Omit<Vehicle, '_createdAt' | '_updatedAt' | '_rev'>

export async function transformToVehicle(
  wpDoc: WP_REST_API_Vehicle,
  client: SanityClient,
  existingImages: Record<string, string> = {},
): Promise<StagedVehicle> {
  const doc: StagedVehicle = {
    _id: `vehicle-${wpDoc.id}`,
    _type: 'vehicle',
  } 

  doc.title = decode(wpDoc.title.rendered).trim()

  if (wpDoc.slug) {
    doc.slug = {_type: 'slug', current: wpDoc.slug}
  }
  
  if (Array.isArray(wpDoc['vehicle-category']) && wpDoc['vehicle-category'].length) {
        doc.vehicleCategory = wpDoc['vehicle-category'].map((catId) => ({
          _key: uuid(),
          _type: 'reference', // This must always be 'reference' for a document reference
          _ref: `vehicle-category-${catId}`, // The ID of the referenced document in Sanity
        }))
  }

  if (wpDoc.author) {
    doc.author = {
      _type: 'reference',
      _ref: `author-${wpDoc.author}`,
    }
  }

  if (wpDoc.date) {
    doc.date = wpDoc.date
  }

  if (wpDoc.modified) {
    doc.modified = wpDoc.modified
  }

  if (wpDoc.status) {
    doc.status = wpDoc.status as StagedVehicle['status']
  }

  if (wpDoc.content) {
    console.debug(wpDoc.content.rendered);
    doc.content = await htmlToBlockContent(wpDoc.content.rendered, client, existingImages)
  }
  
   // Document has an image
   if (typeof wpDoc.featured_media === 'number' && wpDoc.featured_media > 0) {
    // Image exists already in dataset
    if (existingImages[wpDoc.featured_media]) {
      doc.featuredMedia = sanityIdToImageReference(existingImages[wpDoc.featured_media])
    } else {
      // Retrieve image details from WordPress
      const metadata = await wpImageFetch(wpDoc.featured_media)

      if (metadata?.source?.url) {
        // Upload to Sanity
        const asset = await sanityUploadFromUrl(metadata.source.url, client, metadata)

        if (asset) {
          doc.featuredMedia = sanityIdToImageReference(asset._id)
          existingImages[wpDoc.featured_media] = asset._id
        }
      }
    }
  }


  return doc
}