import type { BaseMessageOptions } from 'discord.js'
import { createAlgoliaDocsContainer } from './algoliaDocsContainer.js'

export const createComponents = {
  algoliaResult: createAlgoliaDocsContainer,
} satisfies Record<string, (...args: any) => BaseMessageOptions['components']>
