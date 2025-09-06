import type { SanitySchemaType, WordPressDataType } from './types';
import https from 'https';
import dotenv from "dotenv";

// Load the correct .env file
dotenv.config();

// Replace this with your WordPress site's WP-JSON REST API URL
export const BASE_URL = process.env.WP_BASE_URL || "http://localhost:8080/wp-json/wp/v2";
export const PER_PAGE = process.env.WP_PER_PAGE || "100";

// Create an HTTPS agent that ignores SSL verification
export const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // ⚠ Bypass SSL certificate validation (Use only for development)
});

// Map WordPress types to Sanity schema types
export const WP_TYPE_TO_SANITY_SCHEMA_TYPE: Record<WordPressDataType, SanitySchemaType> = {
  categories: 'category',
  posts: 'post',
  pages: 'page',
  tags: 'tag',
  users: 'author',
  brands: 'brands',
  "vehicle-guides": 'vehicle-guides',
  "vg-category": 'vg-category',
};
