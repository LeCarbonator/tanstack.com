import { MessageFlags, SlashCommandBuilder } from 'discord.js'
import { createCommand } from '../utils/botCommand.js'
import {
  algoliaSearch,
  type AlgoliaHit,
} from '../infrastructure/search/algoliaSearch.js'
import { getFrameworkCommandChoices } from '../infrastructure/frameworks.js'
import {
  createAutocompleteChoices,
  tryGetAutocompleteIndex,
} from '../utils/formatting.js'
import { createDocsCacheKey, docsCache } from '../utils/docsCache.js'
import type { Hit } from 'algoliasearch/lite'
import { logger } from '../logging.js'
import { createComponents } from '../components/index.js'

const data = new SlashCommandBuilder()
  .setName('docs-form')
  .setDescription('Display Tanstack Form documentation')
  .addStringOption((option) =>
    option
      .setName('framework')
      .setDescription('The framework to search docs for')
      .setRequired(true)
      .addChoices(
        getFrameworkCommandChoices([
          'react',
          'vue',
          'angular',
          'solid',
          'lit',
          'svelte',
        ]),
      ),
  )
  .addStringOption((option) =>
    option
      .setName('query')
      .setDescription('The phrase to search for')
      .setRequired(true)
      .setAutocomplete(true),
  )

export default createCommand({
  data,
  execute: async (interaction) => {
    const cacheHit = docsCache.get(
      createDocsCacheKey(interaction.user.id, data.name),
    )

    if (!cacheHit) {
      await interaction.reply('No cache was found')
      return
    }

    const selectedIndex = tryGetAutocompleteIndex(
      interaction.options.getString('query', true),
    )

    if (selectedIndex === null || !('hits' in cacheHit.results[0])) {
      // TODO
      await interaction.reply(
        'TODO: No autocomplete was selected (Call algolia again)',
      )
      return
    }

    logger.debug({
      hitsLength: cacheHit.results[0].hits.length,
      selectedIndex,
      result: cacheHit.results[0].hits[selectedIndex],
      fallback: cacheHit.results[0].hits[0],
    })
    const selectedResult: Hit<AlgoliaHit> | null =
      cacheHit.results[0].hits[selectedIndex] ?? cacheHit.results[0].hits[0]

    if (!selectedResult) {
      await interaction.reply('Nothing found')
      return
    }

    await interaction.reply({
      components: createComponents.algoliaResult(
        selectedResult,
        'form',
        0xefb100,
      ),
      flags: MessageFlags.IsComponentsV2,
    })
  },
  autocomplete: async (interaction) => {
    const query = interaction.options.getFocused()
    const cacheKey = createDocsCacheKey(interaction.user.id, data.name)
    const result = await algoliaSearch({
      query,
      library: 'form',
    })

    docsCache.set(cacheKey, result, 30_000)

    await interaction.respond(createAutocompleteChoices(result))
  },
})
