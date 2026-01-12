import { liteClient, type SearchResponses } from 'algoliasearch/lite'
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
  attributesToSnippet: ['content:50'],
  filters: 'version:latest',
} as const

export type AlgoliaHierarchyKeys =
  | 'lvl0'
  | 'lvl1'
  | 'lvl2'
  | 'lvl3'
  | 'lvl4'
  | 'lvl5'
  | 'lvl6'

// Algolia hit types - our docs-specific shape
export type AlgoliaHierarchy = {
  [K in AlgoliaHierarchyKeys]: string | null
} & Record<string, string | undefined | null>

export interface AlgoliaHit extends Record<string, unknown> {
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

export type AlgoliaSearchResult = SearchResponses<AlgoliaHit>

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

export async function algoliaSearch(
  opts: LiteSearchOptions,
): Promise<AlgoliaSearchResult> {
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
