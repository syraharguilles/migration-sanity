import { FilterIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const vgTypeCategory = defineType({
  name: 'vg-category',
  title: 'Vehicle Guides Category',
  type: 'document',
  icon: FilterIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'name', // Generates slug from the `name` field
        maxLength: 96, // Optional: Limit the length of the slug
      },
      validation: (Rule) => Rule.required(), // Ensure slug is required
    }),
    defineField({
      name: 'content',
      type: 'portableText',
    }),
    defineField({
      name: 'excerpt',
      type: 'portableText',
    }),
    defineField({
      name: 'parent',
      type: 'reference',
      to: [{ type: 'vg-category' }],
      title: 'Parent Category',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'slug.current',
      parent: 'parent.name',
      children: 'children', // Custom virtual field
    },
    prepare({ title, subtitle, parent, children }) {
      const parentInfo = parent ? `Parent: ${parent}` : 'No Parent';
      const childInfo = children?.length
        ? `Children: ${children.map((child) => child.name).join(', ')}`
        : 'No Children';
      return {
        title,
        subtitle: `${parentInfo} ${childInfo}`,
      };
    },
  },
});
