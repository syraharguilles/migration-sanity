import { uuid } from '@sanity/uuid';

export const getPortableTextRules = () => {
  return [
    // Text and inline marks
    {
      deserialize(el, next, block) {
        if (el.nodeName.toLowerCase() === 'a') {
          const href = el.getAttribute('href') || '';
          const title = el.getAttribute('title') || '';
          const target = el.getAttribute('target') || '_self';
          const markKey = uuid();

          // 🔧 FIXED: preserve &nbsp;
          const text = (el.textContent || '').replace(/\u00A0/g, ' ');

          return block({
            _type: 'block',
            _key: uuid(),
            style: 'normal',
            markDefs: [
              {
                _type: 'link',
                _key: markKey,
                href,
                title,
                target
              }
            ],
            children: [
              {
                _type: 'span',
                _key: uuid(),
                text,
                marks: [markKey]
              }
            ]
          });
        }

        return undefined;
      }
    },
    // Paragraph blocks (spans, inline marks, link marks)
    {
      deserialize(node, next, block) {
        if (node.nodeName.toLowerCase() === 'p') {
          const className = node.getAttribute('class') || null;
          const children = [];

          node.childNodes.forEach((el) => {
            if (el.nodeType === 3) {
              // Text Node
              // 🔧 FIXED: preserve &nbsp;
              const text = (el.textContent || '').replace(/\u00A0/g, ' ');
              if (text && text !== '') {
                children.push({
                  _type: 'span',
                  _key: uuid(),
                  text,
                  marks: []
                });
              }
            } else if (el.nodeType === 1) {
              const tag = el.nodeName.toLowerCase();

              if (tag === 'img') {
                const imageUrl = el.getAttribute('src');
                const altText = el.getAttribute('alt') || '';
                const title = el.getAttribute('title') || '';
                const caption = title || altText; // fallback logic

                if (imageUrl) {
                  const isSVG = imageUrl.toLowerCase().endsWith('.svg');

                  children.push({
                    _type: 'inlineImage',
                    _key: uuid(),
                    imageAssets: {
                      _type: 'externalImage',
                      ...(isSVG
                        ? {
                            svg: {
                              _type: 'file',
                              asset: { _type: 'reference', _ref: null },
                              url: imageUrl
                            }
                          }
                        : {
                            imageAssets: {
                              _type: 'image',
                              asset: { _type: 'reference', _ref: null }
                            },
                            url: imageUrl
                          }),
                      alt: altText,
                      caption
                    }
                  });
                }


                return;
              }


              if (tag === 'a') {
                const href = el.getAttribute('href') || '';
                const title = el.getAttribute('title') || '';
                const target = el.getAttribute('target') || '_self';
                const markKey = uuid();

                // 🔧 FIXED: preserve &nbsp;
                const text = (el.textContent || '').replace(/\u00A0/g, ' ');
                if (text && text !== '') {
                  children.push({
                    _type: 'span',
                    _key: uuid(),
                    text,
                    marks: [markKey]
                  });

                  block.markDefs = block.markDefs || [];
                  block.markDefs.push({
                    _type: 'link',
                    _key: markKey,
                    href,
                    title,
                    target
                  });
                }
                return;
              }

              // MARKS
              const marks = [];
              if (['strong', 'b'].includes(tag)) marks.push('strong');
              if (['em', 'i'].includes(tag)) marks.push('em');
              if (tag === 'u') marks.push('underline');
              if (['s', 'strike'].includes(tag)) marks.push('strike-through');

              // 🔧 FIXED: preserve &nbsp;
              const text = (el.textContent || '').replace(/\u00A0/g, ' ');
              if (text && text !== '') {
                children.push({
                  _type: 'span',
                  _key: uuid(),
                  text,
                  marks
                });
              }
            }
          });

          const filtered = children.filter((c) => {
            return c._type === 'inlineImage' || (c.text && c.text.trim() !== '');
          });

          if (filtered.length === 0) return;

          return block({
            _type: 'block',
            _key: uuid(),
            style: 'normal',
            className: className || undefined,
            markDefs: block.markDefs || [],
            children: filtered
          });
        }

        return undefined;
      }
    },
    //HR html tag
    {
      deserialize(node, next, block) {
        if (node.nodeName.toLowerCase() === 'hr') {
          return block({
            _type: 'horizontalRule',
            _key: uuid(),
          })
        }
        return undefined
      }
    },    
    //Tables
    {
      deserialize(node, next, block) {
        if (node.nodeName.toLowerCase() === 'figure' && node.classList.contains('wp-block-table')) {
          const tableEl = node.querySelector('table');
          if (!tableEl) return undefined;

          const parseCell = (cell) => {
            const rowspan = parseInt(cell.getAttribute('rowspan') || '1', 10);
            const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);

            const rawContent = next(cell.childNodes);

            const blockContent = {
              _type: 'block',
              _key: uuid(),
              style: 'normal',
              markDefs: [],
              children: [],
            };

            rawContent.forEach((item) => {
              // Handle __block wrapper (from serializers)
              if (item?._type === '__block' && item.block) {
                blockContent.children.push(...(item.block.children || []));
                blockContent.markDefs.push(...(item.block.markDefs || []));
              }

              // Handle span directly
              else if (item?._type === 'span') {
                blockContent.children.push({
                  ...item,
                  _key: item._key || uuid(),
                });
              }

              // Handle block directly (with marks, like listItem)
              else if (item?._type === 'block') {
                // Keep bullet list items or additional blocks
                blockContent.children.push(...(item.children || []));
                blockContent.markDefs.push(...(item.markDefs || []));
              }
            });

            return {
              _type: 'cell',
              _key: uuid(),
              content: [blockContent],
              ...(rowspan > 1 ? { rowspan } : {}),
              ...(colspan > 1 ? { colspan } : {}),
            };
          };


          const headerRowEl = tableEl.querySelector('thead tr');
          const bodyRowsEls = tableEl.querySelectorAll('tbody tr');
          const footerRowEl = tableEl.querySelector('tfoot tr');

          const headerRow = headerRowEl
            ? [{
                _key: uuid(),
                _type: 'row',
                cells: Array.from(headerRowEl.children).map(parseCell)
              }]
            : [];

          const rows = Array.from(bodyRowsEls).map((rowEl) => ({
            _key: uuid(),
            _type: 'row',
            cells: Array.from(rowEl.children).map(parseCell),
          }));

          const footerRow = footerRowEl
            ? [{
                _key: uuid(),
                _type: 'row',
                cells: Array.from(footerRowEl.children).map(parseCell)
              }]
            : [];

          return block({
            _type: 'tableType',
            _key: uuid(),
            title: 'Imported Table',
            headerRow,
            rows,
            footerRow,
          });
        }

        return undefined;
      }
    },

    // MediaText
    {
      deserialize(node, next, block) {
        if (
          node.nodeName.toLowerCase() === 'div' &&
          node.classList.contains('wp-block-media-text')
        ) {
          const imgEl = node.querySelector('figure img') || node.querySelector('img');
          const figureEl = imgEl?.closest('figure');
          const figcaption = figureEl?.querySelector('figcaption')?.textContent?.trim() || '';
          const contentEl = node.querySelector('.wp-block-media-text__content');

          const imageUrl = imgEl?.getAttribute('src') || null;
          const altText = imgEl?.getAttribute('alt') || '';
          const caption = figcaption || imgEl?.getAttribute('title') || '';
          const isSVG = imageUrl?.toLowerCase().endsWith('.svg');
          const textBlocks = contentEl ? next(contentEl.childNodes) : [];

          const formattedContent = textBlocks
            .map((item: any) => {
              const inner = item._type === '__block' && item.block ? item.block : item;
              return {
                _key: inner._key || uuid(),
                _type: 'block',
                style: inner.style || 'normal',
                markDefs: inner.markDefs || [],
                children: inner.children || []
              };
            })
            .filter((b) => b.children.length > 0);

          return block({
            _type: 'mediaText',
            _key: uuid(),
            content: formattedContent,   
            imageAssets: imageUrl ? {
                _type: 'externalImage',
                ...(isSVG
                  ? {
                      svg: {
                        _type: 'file',
                        asset: { _type: 'reference', _ref: null },
                        url: imageUrl
                      }
                    }
                  : {                      
                      imageAssets :{
                        _type: 'image',
                        asset: { _type: 'reference', _ref: null },
                        url: imageUrl    
                      },       
                    }),
                alt: altText,
                caption
            } : null,
            imagePosition: node.classList.contains('has-media-on-the-right') ? 'right' : 'left',
            verticalAlignment: node.classList.contains('is-vertically-aligned-top')
              ? 'top'
              : node.classList.contains('is-vertically-aligned-bottom')
              ? 'bottom'
              : 'center'
          });
        }

        return undefined;
      }
    },

    // Columns
    {
      deserialize(node, next, block) {
        if (
          node.nodeName.toLowerCase() === 'div' &&
          node.classList.contains('wp-block-columns')
        ) {
          const columns = Array.from(node.children)
            .filter((child) => child.classList.contains('wp-block-column'))
            .map((columnEl) => {
              const rawContent = next(columnEl.childNodes);
              const content = rawContent.map((childBlock: any) => {
                const base = childBlock?._type === '__block' && childBlock.block ? childBlock.block : childBlock;
                return {
                  ...base,
                  _key: base._key || uuid()
                };
              });

              return {
                _type: 'column',
                _key: uuid(),
                content
              };
            });

          return block({
            _type: 'columns',
            _key: uuid(),
            columns
          });
        }

        return undefined;
      }
    },

    // Basic image (externalImage)
    {
      deserialize(node, next, block) {
        if (node.nodeName.toLowerCase() === 'figure') {
          const img = node.querySelector('img');
          const figcaption = node.querySelector('figcaption');

          if (img) {
            const imageUrl = img.getAttribute('src') || null;
            const altText = img.getAttribute('alt') || '';
            const caption = figcaption?.textContent?.trim() || img.getAttribute('title') || '';

            if (imageUrl) {
              const isSVG = imageUrl.toLowerCase().endsWith('.svg');

              return block({
                _type: 'externalImage',
                _key: uuid(),
                ...(isSVG
                  ? {
                      svg: {
                        _type: 'file',
                        asset: { _type: 'reference', _ref: null },
                        url: imageUrl,
                      }
                    }
                  : {
                      imageAssets: {
                        _type: 'externalImage',
                        asset: { _type: 'reference', _ref: null },
                        url: imageUrl,
                      }
                    }),
                caption: caption || altText,
                alt: altText
              });
            }
          }
        }

        return undefined;
      }
    },

    // Tab Blocks
    {
      deserialize(node, next, block) {
        if (
          node.nodeName.toLowerCase() === 'div' &&
          node.classList.contains('o-tabs')
        ) {
          const children = Array.from(node.children);
          const tabs = [];
    
          for (let i = 0; i < children.length; i += 2) {
            const titleEl = children[i];
            const contentEl = children[i + 1];
    
            if (!titleEl || !contentEl) continue;
    
            const title = titleEl.textContent.trim();
            const rawContent = next(contentEl.childNodes); // 🔁 Recursive call
            const content = rawContent.map((childBlock) => {
              const base = childBlock?._type === '__block' && childBlock.block ? childBlock.block : childBlock;
              return {
                ...base,
                _key: base._key || uuid(),
              };
            });
    
            tabs.push({
              _type: 'tab',
              _key: uuid(),
              title,
              content,
            });
          }
    
          return block({
            _type: 'tabs',
            _key: uuid(),
            tabs,
          });
        }
    
        return undefined;
      }
    },
    // Gallery
    {
      deserialize(node, next, block) {
        if (
          node.nodeName.toLowerCase() === 'div' &&
          node.classList.contains('o-gallery')
        ) {
          const slides: any[] = []
          const slideEls = node.querySelectorAll('.o-carousel__slide')

          slideEls.forEach((slide) => {
            // YouTube thumbnails
            const ytThumbImg = slide.querySelector('img[src*="img.youtube.com/vi/"]')
            if (ytThumbImg) {
              const src = ytThumbImg.getAttribute('src') || ''
              const match = src.match(/vi\/([^/]+)\//)
              if (match && match[1]) {
                slides.push({
                  _type: 'gallery',
                  _key: uuid(),
                  mediaType: 'youtube',
                  youtubeId: match[1],
                })
                return
              }
            }

            // Fallback: regular image
            const img = slide.querySelector('img.u-img--base')
            if (img) {
              slides.push({
                _type: 'gallery',
                _key: uuid(),
                mediaType: 'image',
                externalImage :{
                  _type : "externalImage",
                  imageAssets: {
                    _type: 'externalImage',
                    asset: { _type: 'reference', _ref: null },
                    url: img.getAttribute('src'),
                    alt: img.getAttribute('alt') || '',
                  },
                }
              })
            }
          })

          return block({
            _type: 'gallerys',
            _key: uuid(),
            gallerys: slides,
          })
        }

        return undefined
      }
    },
    //Product Block Type
    {
      deserialize(node, next, block) {
        const isSlider =
          node.nodeName.toLowerCase() === 'div' &&
          node.classList.contains('o-shortcode-content') &&
          node.querySelector('.o-recommended-products__card');

        if (!isSlider) return undefined;

        const slideEls = node.querySelectorAll('.o-carousel__slide');
        const products = [];

        slideEls.forEach((slide) => {
          const card = slide.querySelector('.o-recommended-products__card');
          if (!card) return;

          const titleEl = card.querySelector('.o-recommended-products__title');
          const imageEl = card.querySelector('.o-recommended-products__thumbnail img');
          const partNumberEl = card.querySelector('.o-recommended-products__number');
          const priceEls = card.querySelectorAll('.o-recommended-products__price');
          const buttonEl = card.querySelector('button');
          const linkEl = card.closest('a');

          // Brand handling (image or text fallback)
          const brandWrapperEl = card.querySelector('.o-recommended-products__brand-wrapper');
          let brandExternalImage;
          if (brandWrapperEl) {
            const brandImg = brandWrapperEl.querySelector('img');
            if (brandImg) {
              const alt = brandImg.getAttribute('alt') || '';
              const url = brandImg.getAttribute('src') || '';
              brandExternalImage = {
                name: alt,
                logo: {
                  _type: 'externalImage',
                  imageAssets: {
                    _type: 'image',                    
                    asset: { _type: 'reference', _ref: null },
                  },
                  url,
                  alt,
                }
              };
            } else {
              const name = brandWrapperEl.textContent?.trim();
              if (name) {
                brandExternalImage = { name };
              }
            }
          }

          const productTitle = titleEl?.textContent?.trim() || '';
          const partNumberRaw = partNumberEl?.textContent || '';
          const partNumber = partNumberRaw.replace(/PART #/i, '').trim();

          const priceText = priceEls?.[1]?.textContent || priceEls?.[0]?.textContent || '';
          const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

          const imageUrl = imageEl?.getAttribute('src') || '';
          const imageAlt = imageEl?.getAttribute('alt') || '';

          const productImage = imageEl
            ? {
                _type: 'externalImage',
                imageAssets: {
                  _type: 'image',                 
                  asset: { _type: 'reference', _ref: null },
                },
                 url: imageUrl,
                alt: imageAlt,
              }
            : undefined;

          products.push({
            _type: 'inlineProduct',
            _key: uuid(),
            productTitle,
            partNumber,
            price: isNaN(price) ? undefined : price,
            buttonLabel: buttonEl?.textContent?.trim() || 'Shop now',
            buttonLink: linkEl?.getAttribute('href') || '',
            brand: brandExternalImage,
            externalImage: productImage,
          });
        });

        return block({
          _type: 'productBlock',
          _key: uuid(),
          products,
        });
      }
    }



  ];
};
