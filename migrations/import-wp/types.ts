import type {
    WP_REST_API_Categories,
    WP_REST_API_Pages,
    WP_REST_API_Posts,   
    WP_REST_API_Tags,
    WP_REST_API_Users,
  } from 'wp-types'
  
  import type {
    WP_REST_API_Brands,
    WP_REST_API_VG_Category,
    WP_REST_API_Vehicle_Guides
  } from './types'

  export type WordPressDataType = 'categories' | 'posts' | 'pages' | 'tags' | 'users' | 'brands' | 'vgCategory' | 'vehicleGuides'
  
  export type WordPressDataTypeResponses = {
    categories: WP_REST_API_Categories
    pages: WP_REST_API_Pages
    posts: WP_REST_API_Posts   
    tags: WP_REST_API_Tags
    author: WP_REST_API_Users
    brands: WP_REST_API_Brands
    vehicleGuides: WP_REST_API_Vehicle_Guides
    vgCategory : WP_REST_API_VG_Category
  }
  
  export type SanitySchemaType = 'category' | 'post' | 'page' | 'tag' | 'author' | 'brands' | 'vehicleGuides' | 'vgCategory'