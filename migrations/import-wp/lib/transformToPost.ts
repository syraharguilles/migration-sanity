import {uuid} from '@sanity/uuid'
import {decode} from 'html-entities'
import type {SanityClient, FieldDefinition} from 'sanity'
import type {WP_REST_API_Post} from 'wp-types'

import type {Post} from '../../../sanity.types'
import {htmlToBlockContent} from './htmlToBlockContent'
import {sanityIdToImageReference} from './sanityIdToImageReferences'
import {sanityUploadFromUrl} from '../../../utilities/common/sanityUploadFromUrl'
import {wpImageFetch} from './wpImageFetch'
import {isImageAccessible, sanitizeExcerpt} from '../../../utilities/default/utils'

const { logFailedImage } = require('./imageLog');

// Remove these keys because they'll be created by Content Lake
type StagedPost = Omit<Post, '_createdAt' | '_updatedAt' | '_rev'>

export async function transformToPost(
  wpDoc: WP_REST_API_Post,
  client: SanityClient,
  existingImages: Record<string, string> = {},
): Promise<StagedPost> {
  const doc: StagedPost = {
    _id: `post-${wpDoc.id}`,
    _type: 'post',
  }

  doc.title = decode(wpDoc.title.rendered).trim()

  if (wpDoc.slug) {
    doc.slug = {_type: 'slug', current: wpDoc.slug}
  }

  if (Array.isArray(wpDoc.categories) && wpDoc.categories.length) {
    doc.categories = wpDoc.categories.map((catId) => ({
      _key: uuid(),
      _type: 'reference',
      _ref: `category-${catId}`,
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

  if (wpDoc.excerpt) {
    doc.excerpt = sanitizeExcerpt(wpDoc.excerpt.rendered)
  }

  if (wpDoc.modified) {
    doc.modified = wpDoc.modified
  }

  if (wpDoc.status) {
    doc.status = wpDoc.status as StagedPost['status']
  }

  doc.sticky = wpDoc.sticky == true
    
  doc.rawHtml = wpDoc.content.rendered   
 // if (wpDoc.content) {
    
    //doc.content = await htmlToBlockContent(wpDoc.content.rendered, client, existingImages)
    //console.log("TRANSFORM POST test: ", JSON.stringify(doc.content, null, 2))
  //}  

  let featuredImageIssue = false; // ✅ Track if something goes wrong in featured image

  // if (typeof wpDoc.featured_media === 'number' && wpDoc.featured_media > 0) {
  //   try {
  //     if (existingImages[wpDoc.featured_media]) {
  //       doc.featuredMedia = sanityIdToImageReference(existingImages[wpDoc.featured_media]);
  //     } else {
  //       const metadata = await wpImageFetch(wpDoc.featured_media);

  //       if (metadata?.source?.url) {
  //         const imageUrl = metadata.source.url;
  //         const isValidImage = await isImageAccessible(imageUrl);

  //         if (!isValidImage) {
  //           featuredImageIssue = true;
  //           console.warn(`🚫 Broken/inaccessible featured image: ${imageUrl}`);
  //           logFailedImage({
  //             title: decode(wpDoc.title.rendered).trim() + "/" + wpDoc.id,
  //             imageUrl: imageUrl,
  //             reason: "Image inaccessible or invalid format",
  //             timestamp: new Date().toISOString()
  //           });
  //         } else {
  //           try {
  //             const asset = await sanityUploadFromUrl(imageUrl, client, metadata);
  //             if (asset) {
  //               doc.featuredMedia = sanityIdToImageReference(asset._id);
  //               existingImages[wpDoc.featured_media] = asset._id;
  //             }
  //           } catch (uploadError) {
  //             featuredImageIssue = true;
  //             console.error(`❌ Failed to upload featured image: ${imageUrl}`, uploadError);
  //             logFailedImage({
  //               title: decode(wpDoc.title.rendered).trim() + "/" + wpDoc.id,
  //               imageUrl: imageUrl,
  //               reason: "Sanity upload failed",
  //               errorMessage: uploadError.message,
  //               timestamp: new Date().toISOString()
  //             });
  //           }
  //         }

  //       } else {
  //         featuredImageIssue = true;
  //         console.warn(`⚠️ No valid URL for featured_media ID: ${wpDoc.featured_media}`);
  //         logFailedImage({
  //           title: decode(wpDoc.title.rendered).trim() + "/" + wpDoc.id,
  //           imageUrl: null,
  //           reason: `No valid URL for featured_media ID: ${wpDoc.featured_media}`,
  //           timestamp: new Date().toISOString()
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     featuredImageIssue = true;
  //     console.error(`❌ Unexpected error processing featured media:`, error);
  //     logFailedImage({
  //       title: decode(wpDoc.title.rendered).trim() + "/" + wpDoc.id,
  //       imageUrl: null,
  //       reason: "Unexpected error fetching/uploading featured media",
  //       errorMessage: error.message,
  //       timestamp: new Date().toISOString()
  //     });
  //   }
  // }

  console.log(`✅ Finished transforming post ID: ${wpDoc.id}`);
  // ✅ Final check before return
  // if (featuredImageIssue) {
  //   console.warn(`⚠️ Skipping post due to featured image issue: ${doc._id}`);
  //   return null; // ❌ Skip uploading this post
  // }

  return doc;

  //return doc
}