import type {
  SanityClient,
  SanityImageAssetDocument,
  UploadClientConfig
} from '@sanity/client';

export async function sanityUploadFromUrl(
  url: string,
  client: SanityClient,
  metadata: UploadClientConfig
): Promise<SanityImageAssetDocument | null> {
  console.log('📤 Uploading asset from URL:', url);

  try {
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`❌ Failed to fetch: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const isSVG = contentType === 'image/svg+xml';

    const buffer = await response.arrayBuffer();
    const file = new File([buffer], metadata.filename || 'image', { type: contentType });

    // Choose upload type based on MIME
    const assetType = isSVG ? 'file' : 'image';
    const data = await client.assets.upload(assetType, file, metadata);

    console.log(`✅ ${isSVG ? 'SVG' : 'Image'} Uploaded:`, data._id);
    
    return data;
  } catch (error) {
    console.error(`🚨 Failed to upload from ${url}`);
    console.error('upload error:', error);
    return null;
  }
}
