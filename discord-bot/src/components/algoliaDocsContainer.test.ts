import { describe, expect, it } from 'vitest'
import type { AlgoliaHit } from '../infrastructure/search/algoliaSearch.js'
import { createComponents } from './index.js'

const exampleHit: AlgoliaHit = {
  version: 'latest',
  tags: [],
  url: 'https://tanstack.com/form/latest/docs/philosophy#generics-are-grim',
  url_without_variables:
    'https://tanstack.com/form/latest/docs/philosophy#generics-are-grim',
  url_without_anchor: 'https://tanstack.com/form/latest/docs/philosophy',
  anchor: 'generics-are-grim',
  content: null,
  content_camel: null,
  lang: 'en',
  language: 'en',
  type: 'lvl2',
  no_variables: false,
  weight: {
    pageRank: 100,
    level: 80,
    position: 8,
  },
  hierarchy: {
    lvl0: 'all',
    lvl1: 'Philosophy',
    lvl2: 'Generics are grim',
    lvl3: null,
    lvl4: null,
    lvl5: null,
    lvl6: null,
  },
  recordVersion: 'v3',
  library: 'form',
  framework: 'all',
  objectID: '8-https://tanstack.com/form/latest/docs/philosophy',
}

describe('algoliaDocsContainer', () => {
  it('should not error during serialization', () => {
    const components = createComponents.algoliaResult(exampleHit, 'form') ?? []

    for (const component of components) {
      expect(() => component.toJSON()).not.toThrow()
    }
  })
})
