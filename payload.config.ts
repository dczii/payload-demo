import path from 'path'
// import { postgresAdapter } from '@payloadcms/db-postgres'
import { en } from 'payload/i18n/en'
import {
  AlignFeature,
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  ChecklistFeature,
  HeadingFeature,
  IndentFeature,
  InlineCodeFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  RelationshipFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'

import sharp from 'sharp'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const AttachmentsBlock = {
  slug: 'attachments',
  interfaceName: 'Attachments',
  fields: [
    // required
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
}

const RelatedSolutionsBlock = {
  slug: 'related-solutions',
  interfaceName: 'RelatedSolutinosBlock',
  fields: [
    // required
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
}

export default buildConfig({
  //editor: slateEditor({}),
  editor: lexicalEditor(),
  collections: [
    {
      slug: 'users',
      auth: true,
      access: {
        delete: () => false,
        update: () => false,
      },
      fields: [],
    },
    {
      slug: 'pages',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'categories',
          type: 'relationship',
          relationTo: ['categories'],
        },
        {
          name: 'sub-categories',
          type: 'relationship',
          relationTo: ['sub-categories'],
          sortOptions: 'title',
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'solution-title',
          type: 'text',
        },
        {
          name: 'overview',
          type: 'richText',
        },
        {
          name: 'kal URL',
          type: 'text',
        },
        {
          name: 'attachments', // required
          type: 'blocks', // required
          minRows: 1,
          maxRows: 3,
          blocks: [
            // required
            AttachmentsBlock,
          ],
        },
        {
          name: 'related-solutions', // required
          type: 'blocks', // required
          minRows: 1,
          maxRows: 4,
          blocks: [
            // required
            RelatedSolutionsBlock,
          ],
        },
      ],
    },
    {
      slug: 'categories',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          unique: true,
        },
        // {
        //   name: 'sub-category',
        //   slug: 'sub-category',
        //   type: 'blocks',
        //   minRows: 0,
        //   maxRows: 10,
        //   blocks: [SubCategoryBlock],
        // },
      ],
    },
    {
      slug: 'sub-categories',
      admin: {
        useAsTitle: 'sub-category-title',
      },
      fields: [
        {
          name: 'categories',
          type: 'relationship',
          relationTo: ['categories'],
          sortOptions: 'title',
          required: true,
        },
        {
          name: 'sub-category-title',
          type: 'text',
          required: true,
          unique: true,
        },
      ],
    },
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // db: postgresAdapter({
  //   pool: {
  //     connectionString: process.env.POSTGRES_URI || ''
  //   }
  // }),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),

  /**
   * Payload can now accept specific translations from 'payload/i18n/en'
   * This is completely optional and will default to English if not provided
   */
  i18n: {
    supportedLanguages: { en },
  },

  admin: {
    autoLogin: {
      email: 'dev@payloadcms.com',
      password: 'test',
      prefillOnly: true,
    },
  },
  async onInit(payload) {
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'dev@payloadcms.com',
          password: 'test',
        },
      })
    }
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.

  // This is temporary - we may make an adapter pattern
  // for this before reaching 3.0 stable
  sharp,
})
