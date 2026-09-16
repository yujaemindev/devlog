import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    articles: defineCollection({
      type: 'page',
      source: 'articles/**/*.md',
      schema: z.object({
        tags: z.string().default(''),
        date: z.date(),
        image: z.string().optional(),
        author: z.string().optional(),
        slug: z.string().optional(),
        draft: z.boolean().default(false),
      }),
      indexes: [
        { columns: ['draft', 'date'], name: 'idx_articles_draft_date' },
      ],
    }),
    author: defineCollection({
      type: 'page',
      source: 'author/**/*.md',
      schema: z.object({
        page: z.string().optional(),
        draft: z.boolean().default(false),
      }),
    }),
  },
})
