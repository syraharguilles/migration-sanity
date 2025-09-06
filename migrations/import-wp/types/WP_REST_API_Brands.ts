export interface WP_REST_API_Brands {
    id: number; // Unique ID of the brand
    slug: string; // URL-friendly identifier
    title: {
      rendered: string; // Title of the brand
    };
    content: {
      rendered: string; // Main content of the brand post
    };
    excerpt?: {
      rendered: string; // Excerpt for the brand post
    };
    date: string; // Published date in ISO format
    modified: string; // Last modified date in ISO format
    author: number; // Author ID
    featured_media: number; // Featured media ID
    meta?: Record<string, any>; // Custom meta fields
    sticky?: boolean; // Indicates if the post is sticky
    status: 'publish' | 'draft' | 'pending' | 'private'; // Post status
    type: string; // Post type, e.g., "brand"
    acf?: Record<string, any>; // Advanced Custom Fields (optional)
    categories?: number[]; // Array of category IDs
    tags?: number[]; // Array of tag IDs
    [key: string]: any; // Allow additional fields to accommodate future changes
  }
  