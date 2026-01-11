import { liteClient } from 'algoliasearch/lite'
import { env } from '../../config.js'

const algoliaClient = liteClient(
  env.algoliaConfig.applicationId,
  env.algoliaConfig.apiKey,
)

const ALGOLIA_SEARCH_PARAMS = {
  attributesToRetrieve: [
    'hierarchy.lvl1',
    'hierarchy.lvl2',
    'hierarchy.lvl3',
    'hierarchy.lvl4',
    'hierarchy.lvl5',
    'hierarchy.lvl6',
    'url',
    'content',
    'library',
  ],
  attributesToSnippet: ['content:20'],
  filters: 'version:latest',
} as const

// Algolia hit types - our docs-specific shape
interface AlgoliaHierarchy {
  lvl0?: string
  lvl1?: string
  lvl2?: string
  lvl3?: string
  lvl4?: string
  lvl5?: string
  lvl6?: string
  [key: string]: string | undefined
}

interface AlgoliaHit extends Record<string, unknown> {
  objectID: string
  url: string
  library?: string
  hierarchy: AlgoliaHierarchy
  content?: string
  type?: string
  __position: number
  __queryID?: string
  _highlightResult?: Record<string, unknown>
  _snippetResult?: Record<string, unknown>
}

interface LiteSearchOptions {
  query: string
  library?: string
  framework?: string
  /**
   * @default 10
   */
  limit?: number
}

function buildFilters(opts: LiteSearchOptions) {
  const filters: string[] = []
  if (opts.library) {
    filters.push(`library:${opts.library}`)
  }
  if (opts.framework) {
    filters.push(`(framework:${opts.framework} OR framework:)`)
  }
}

export async function algoliaSearch(opts: LiteSearchOptions) {
  const limit = Math.max(opts.limit ?? 10, 25) // 25 is the max allowed by Discord API.

  return await algoliaClient.search({
    requests: [
      {
        indexName: 'tanstack-test',
        query: opts.query,
        hitsPerPage: 3,
        filters: 'framework:react',
        // filters: 'framework:angular',
        // filters: `category:${opts.category}`,
      },
    ],
  })
}
