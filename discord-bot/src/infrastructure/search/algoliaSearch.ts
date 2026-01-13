import { liteClient, type SearchResponses } from 'algoliasearch/lite'
import { env } from '../../config.js'
import { discordLimits } from '../discordApiConstants.js'
import type { FrameworkValue, TanStackLibrary } from '../frameworks.js'

const algoliaClient = liteClient(
  env.algoliaConfig.applicationId,
  env.algoliaConfig.apiKey,
)

export type AlgoliaHierarchyKeys =
  | 'lvl0'
  | 'lvl1'
  | 'lvl2'
  | 'lvl3'
  | 'lvl4'
  | 'lvl5'
  | 'lvl6'

export const algoliaHierarchyKeys: AlgoliaHierarchyKeys[] = [
  'lvl0',
  'lvl1',
  'lvl2',
  'lvl3',
  'lvl4',
  'lvl5',
  'lvl6',
]

// Algolia hit types - our docs-specific shape
export type AlgoliaHierarchy = {
  [K in AlgoliaHierarchyKeys]: string | null
} & Record<string, string | undefined | null>

export interface AlgoliaHit extends Record<string, unknown> {
  objectID: string
  url: string
  library?: string
  hierarchy: AlgoliaHierarchy
  content?: string | null
  type?: string
}

export type AlgoliaSearchResult = SearchResponses<AlgoliaHit>

interface LiteSearchOptions {
  query: string
  framework: FrameworkValue | null
  library: TanStackLibrary
  /**
   * @default 10
   */
  limit?: number
}

function buildFilters(opts: LiteSearchOptions) {
  const filters: string[] = ['version:latest']
  filters.push(`library:${opts.library}`)
  if (opts.framework) {
    filters.push(`(framework:${opts.framework} OR framework:all)`)
  }

  return filters.join(' AND ')
}

export async function algoliaSearch(
  opts: LiteSearchOptions,
): Promise<AlgoliaSearchResult> {
  const limit = Math.min(
    opts.limit ?? 10,
    discordLimits.autoComplete.choiceCount,
  )

  return await algoliaClient.search({
    requests: [
      {
        indexName: 'tanstack-test',
        query: opts.query,
        hitsPerPage: limit,
        filters: buildFilters(opts),
        attributesToSnippet: ['content:50'],
      },
    ],
  })
}
