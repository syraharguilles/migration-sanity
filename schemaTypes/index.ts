import {authorType} from './authorType'
import {categoryType} from './categoryType'
import {externalImageType} from './wsywygComponents/externalImageType'
import {pageType} from './pageType'
import {postType} from './postType'
import {productType} from './productType'
import {tagType} from './tagType'
import {portableTextType} from './portableTextType'
import {columnsType} from './wsywygComponents/columnsType'
import {columnType} from './wsywygComponents/columnType'
import {brandsType} from './brandsType'
import {vehicleGuidesType} from './vehicleGuidesType'
import {vgTypeCategory} from './vgCategoryType'
import {mediaTextType} from './wsywygComponents/mediaTextType'
import {tableType} from './wsywygComponents/tableType'
import { metaTags } from "./meta/metaTagsType";
import { htmlEmbed } from './wsywygComponents/htmlEmbedType'
import { inlineImage } from './wsywygComponents/inlineImageType'

import {tabsType} from './wsywygComponents/tabsType'
import {tabType} from './wsywygComponents/tabType'
import { hrType } from './wsywygComponents/horinzontalType'
import { galleryType } from './wsywygComponents/galleryType'
import { gallerysType } from './wsywygComponents/gallerysType'
import { productBlockType } from './wsywygComponents/productBlockType'


export const schemaTypes = [
  authorType,
  categoryType,
  pageType,
  postType,
  productType,
  columnsType,
  columnType, 
  tagType,
  externalImageType,
  portableTextType,
  brandsType,
  vehicleGuidesType,
  vgTypeCategory,
  mediaTextType,
  tableType,
  metaTags,
  htmlEmbed,
  inlineImage,
  productBlockType,
  tabsType,
  tabType,
  hrType,
  gallerysType,
  galleryType  
]