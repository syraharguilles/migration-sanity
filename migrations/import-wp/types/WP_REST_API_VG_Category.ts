export interface WP_REST_API_VG_Category {
    id: number; // Unique ID of the term
    name: string; // Name of the term (e.g., "SUVs")
    slug: string; // URL-friendly version of the name
    description?: string; // Description of the term
    count: number; // Number of posts associated with this term
    parent: number; // Parent term ID (0 if no parent)
    taxonomy: string; // Taxonomy type (e.g., "vehicle-category")
    meta?: Record<string, any>; // Custom metadata
    _links?: Record<string, any>; // Links for related resources
  }
  