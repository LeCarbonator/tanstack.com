import type { Hit } from 'algoliasearch/lite'
import {
  bold,
  MessageFlags,
  SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
} from 'discord.js'
import { createComponents } from '../components/index.js'
import {
  getFrameworkCommandChoices,
  getTanStackLibraryLabel,
  type FrameworkValue,
  type TanStackLibrary,
} from '../infrastructure/frameworks.js'
import {
  algoliaSearch,
  type AlgoliaHit,
  type AlgoliaSearchResult,
} from '../infrastructure/search/algoliaSearch.js'
import { logger } from '../logging.js'
import { createCommand } from '../utils/botCommand.js'
import { createDocsCacheKey, docsCache } from '../utils/docsCache.js'
import {
  createAutocompleteChoices,
  tryGetAutocompleteIndex,
} from '../utils/formatting.js'

interface DocsCommandConfig {
  library: TanStackLibrary
  frameworks: FrameworkValue[]
  color: number
}

// Changes to the spec will not show up until `pnpm deploy:commands` has been run.
// Note that command deployments are heavily rate limited and should not be spammed.
const SPEC: DocsCommandConfig[] = [
  {
    library: 'form',
    frameworks: ['react', 'vue', 'angular', 'solid', 'lit', 'svelte'],
    color: 0xefb100, // yellow
  },
  {
    library: 'query',
    frameworks: ['react', 'vue', 'angular', 'solid', 'svelte'],
    color: 0xfb2c36, // bright red
  },
  {
    library: 'table',
    frameworks: ['react', 'vue', 'angular', 'solid', 'lit', 'svelte', 'qwik'],
    color: 0x155dfc, // blue
  },
  {
    library: 'router',
    frameworks: ['react', 'solid'],
    color: 0x5ea500, // green
  },
  {
    library: 'start',
    frameworks: ['react', 'solid'],
    color: 0x00b8db, // bright turqoise
  },
  {
    library: 'db',
    frameworks: ['react', 'vue', 'solid', 'svelte', 'vanilla'],
    color: 0xff6900, // bright orange
  },
  {
    library: 'ai',
    frameworks: ['react', 'solid', 'vanilla'],
    color: 0xf6339a, // neon pink
  },
  {
    library: 'virtual',
    frameworks: ['react', 'vue', 'angular', 'solid', 'lit', 'svelte'],
    color: 0x7f22fe, // neon purple
  },
  {
    library: 'pacer',
    frameworks: ['react', 'preact', 'solid'],
    color: 0x7ccf00, // bright green
  },
  {
    library: 'store',
    frameworks: ['react', 'preact', 'vue', 'angular', 'solid', 'svelte'],
    color: 0xae7d44, // brown
  },
  {
    library: 'devtools',
    frameworks: ['react', 'preact', 'solid', 'vanilla'],
    color: 0xf5f5f5, // white-ish
  },
]

export default SPEC.map(createDocsCommand)

function createDocsCommand(config: DocsCommandConfig) {
  const data = buildDocsCommand(config.library, config.frameworks)

  function performSearch(query: string, framework: FrameworkValue) {
    return algoliaSearch({
      library: config.library,
      limit: 25,
      query,
      framework,
    })
  }

  return createCommand({
    data,
    execute: async (interaction) => {
      const { query, framework, mention, hideMessage } =
        getDocsParams(interaction)
      const cacheHit = docsCache.get(
        createDocsCacheKey(interaction.user.id, data.name),
      )

      let searchResult: AlgoliaSearchResult

      if (cacheHit) {
        searchResult = cacheHit
      } else {
        searchResult = await performSearch(query, framework)
      }

      const selectedIndex = tryGetAutocompleteIndex(query)

      if (selectedIndex === null) {
        logger.debug(
          'User entered custom query, fallback to calling algolia search once more',
        )
        searchResult = await performSearch(query, framework)
      }

      const result = searchResult.results.at(0)

      if (!result || !('hits' in result)) {
        logger.debug({
          message: 'Algolia result cannot be parsed',
          result,
        })
        return void interaction.reply(
          `${bold('No results found')}\nTry adjusting your search or filters to find what you're looking for.`,
        )
      }

      logger.trace({
        hitsLength: result.hits.length,
        selectedIndex,
        selectedHit: selectedIndex !== null ? result.hits[selectedIndex] : null,
        fallback: result.hits[0],
      })

      const selectedResult: Hit<AlgoliaHit> | null =
        result.hits[selectedIndex ?? 0]

      if (!selectedResult) {
        logger.debug({
          message: 'No results found for query',
          query,
          framework,
        })
        return void interaction.reply(
          `${bold('No results found')}\nTry adjusting your search or filters to find what you're looking for.`,
        )
      }

      await interaction.reply({
        components: createComponents.algoliaResult({
          hit: selectedResult,
          library: config.library,
          fallbackColor: config.color,
          mention,
        }),
        flags:
          MessageFlags.IsComponentsV2 |
          (hideMessage ? MessageFlags.Ephemeral : 0),
      })
    },
    autocomplete: async (interaction) => {
      const { query, framework } = getDocsParams(interaction)
      const cacheKey = createDocsCacheKey(interaction.user.id, data.name)
      const result = await performSearch(query, framework)

      docsCache.set(cacheKey, result, 30_000)

      await interaction.respond(createAutocompleteChoices(result))
    },
  })
}

function buildDocsCommand<T extends Array<FrameworkValue>>(
  name: TanStackLibrary,
  frameworks: T,
) {
  const data = new SlashCommandBuilder()
    .setName(`docs-${name}`)
    .setDescription(
      `Display Tanstack ${getTanStackLibraryLabel(name)} documentation`,
    )
    .addStringOption((option) =>
      option
        .setName('framework')
        .setDescription('The framework to search the documentation for')
        .setRequired(true)
        .addChoices(getFrameworkCommandChoices(frameworks)),
    )
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The phrase to search for')
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addBooleanOption((option) =>
      option.setName('hide').setDescription("Hide the bot's message"),
    )
    .addUserOption((option) =>
      option.setName('mention').setDescription('Mention a user'),
    )

  return data
}

function getDocsParams(
  interaction: ChatInputCommandInteraction | AutocompleteInteraction,
) {
  const framework = interaction.options.getString(
    'framework',
    true,
  ) as FrameworkValue
  const query = interaction.options.getString('query', true)
  const hideMessage = interaction.options.getBoolean('hide') ?? false

  let mention = null
  if (interaction.isChatInputCommand()) {
    mention = interaction.options.getUser('mention')
  }

  return { framework, query, hideMessage, mention }
}
