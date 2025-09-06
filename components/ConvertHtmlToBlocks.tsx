'use client'
import React, { useState } from 'react'
import { Button, Stack, Dialog, Card } from '@sanity/ui'
import { set, useFormValue, useClient } from 'sanity'
import { htmlToBlockContent } from '../components/ProcessSanityHTMLtoBlock'
import { Schema } from "@sanity/schema";
import { schemaTypes } from "../schemaTypes";
import { processImages } from '../utilities/rawHTML/processImage'
import { cleanColumns } from '../utilities/rawHTML/cleaners'

type Props = {
  onChange: (patch: any) => void
}

export function ConvertHtmlToBlocks({ onChange }: Props) {
  const rawHtml = useFormValue(['rawHtml']) as string;
  const [previewBlocks, setPreviewBlocks] = useState<any[] | null>(null);
  const [invalidRefs, setInvalidRefs] = useState<any[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const client = useClient(); // ✅ use Sanity client hook

  const handleConvert = async () => {
    if (!rawHtml || typeof rawHtml !== 'string') {
      console.warn('No HTML content to convert');
      return;
    }

    const compiledSchema = Schema.compile({ types: schemaTypes });
    const blockContentSchema = compiledSchema
      .get('post') // make sure this matches your document type
      .fields.find((f) => f.name === 'content')?.type;

    if (!blockContentSchema) {
      console.error('❌ Could not find block content schema for post.content');
      return;
    }

    let blocks = await htmlToBlockContent(rawHtml, blockContentSchema);

    blocks.forEach((block, i) => {
      if (!block._type) console.warn(`❗ Missing _type at blocks[${i}]`, block);
      block.children?.forEach((child, j) => {
        if (!child._type) console.warn(`❗ Missing _type at blocks[${i}].children[${j}]`, child);
      });
    });

    blocks = await processImages(blocks, client);

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
    

    console.log('🧱 Final blocks to preview:', blocks);
    setPreviewBlocks(blocks);
  };

  const handleSave = () => {
    if (!previewBlocks || !Array.isArray(previewBlocks)) {
      console.error('❌ No blocks to save');
      return;
    }

    const brokenImages: string[] = [];
    const failedRefs: any[] = []

    previewBlocks.forEach((block) => {

      console.log(block);
      // Top-level image blocks
      if (
        ['externalImage', 'inlineImage', 'mediaText', 'gallerys', 'productBlock'].includes(block._type) &&
        block.imageAssets?.asset?._ref === null
      ) {
        brokenImages.push(`${block._type} (key: ${block._key || 'no-key'}) - ${block.imageAssets?.url || 'no-url'}`);
        failedRefs.push({         
          type: block._type,
          url: block.imageAssets.url || '',
          key: block._key,
        })
      }
  
      // Children inside block (e.g., inlineImage in spans)
      if (Array.isArray(block.children)) {
        block.children.forEach((child) => {
          if (
            child._type === 'inlineImage' &&
            child.imageAssets?.asset?._ref === null
          ) {
            brokenImages.push(`inlineImage (key: ${child._key || 'no-key'}) - ${child.imageAssets?.url || 'no-url'}`);
            failedRefs.push({
              block: "inline Image",
              type: child._type,
              url: child.imageAssets.url || '',
              key: child._key,
            })
          }
        });
      }
  
      // mediaText content blocks
      if (block._type === 'mediaText' && Array.isArray(block.content)) {
        block.content.forEach((inner) => {
          if (Array.isArray(inner.children)) {
            inner.children.forEach((child) => {
              if (
                child._type === 'inlineImage' &&
                child.imageAssets?.asset?._ref === null
              ) {
                brokenImages.push(`inlineImage in mediaText (key: ${child._key || 'no-key'}) - ${child.imageAssets?.url || 'no-url'}`);
                failedRefs.push({
                  block: "Media Text",
                  type: child._type,
                  url: child.imageAssets.url || '',
                  key: child._key,
                })
              }
            });
          }
        });
      }         

      if (block._type === 'gallerys' && Array.isArray(block.gallerys)) {
        block.gallerys.forEach((galleryItem) => {
          if (
            galleryItem._type === 'gallery' &&
            galleryItem.mediaType === 'image' && // Only validate image type
            galleryItem.imageAssets?.asset?._ref === null
          ) {
            brokenImages.push(`Gallery image (key: ${galleryItem._key || 'no-key'}) - ${galleryItem.imageAssets?.url || 'no-url'}`);
            failedRefs.push({
              block: "Gallery",
              type: 'externalImage',
              url: galleryItem.imageAssets?.url || '',
              key: galleryItem._key,
            });
          }
        });
      }      

      // ✅ Check nested productBlock images and brand logos
      console.log("test Block", block);
      if (block._type === 'productBlock' && Array.isArray(block.products)) {
        block.products.forEach((product) => {
          // Product image
          const productImage = product?.image?.imageAssets;
          if (productImage?.url && productImage?.asset?._ref === null) {
            brokenImages.push(`Product Image (key: ${product._key || 'no-key'}) - ${productImage?.url}`);
            failedRefs.push({
              block: 'ProductBlock',
              type: 'product.image',
              url: productImage.url,
              key: product._key,
            });
          }

          if (productImage?.url && productImage?.asset?._ref === null) {
            delete product.image.imageAssets.asset; // 🧹 remove invalid ref
            brokenImages.push(`Product Image (key: ${product._key || 'no-key'}) - ${productImage?.url}`);
            failedRefs.push({
              block: 'ProductBlock',
              type: 'product.image',
              url: productImage.url,
              key: product._key,
            });
          }

          // Brand logo
          const brandLogo = product?.brand?.logo?.imageAssets;
          if (brandLogo?.url && brandLogo?.asset?._ref === null) {
            brokenImages.push(`Brand Logo (key: ${product._key || 'no-key'}) - ${brandLogo?.url}`);
            failedRefs.push({
              block: 'ProductBlock',
              type: 'product.brand.logo',
              url: brandLogo.url,
              key: product._key,
            });
          }
        });
      }
    });
  
    if (failedRefs.length > 0) {
      setInvalidRefs(failedRefs)
      setShowModal(true)
      return
    }

    console.log('✅ Setting blocks to content:', previewBlocks);
    onChange(set(previewBlocks));
  };

  return (
    <Stack space={3}>
      <Button text="Convert HTML to Blocks" tone="primary" onClick={handleConvert} />
      {previewBlocks && (
        <>
          <pre style={{ maxHeight: 300, overflow: 'auto', background: '#000', padding: '1em' }}>
            {JSON.stringify(previewBlocks, null, 2)}
          </pre>
          <Button text="✅ Confirm & Save to Content" tone="positive" onClick={handleSave} />
        </>
      )}

      {showModal && invalidRefs && (
        <Dialog
          id="missing-image-refs"
          header="🚫 Missing Image _refs"
          width={1}
          onClose={() => setShowModal(false)}
        >
          <Card padding={4} tone="critical">
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
              {JSON.stringify(invalidRefs, null, 2)}
            </pre>
          </Card>
          <Button text="Close" onClick={() => setShowModal(false)} tone="primary" />
        </Dialog>
      )}
    </Stack>
  );
}
