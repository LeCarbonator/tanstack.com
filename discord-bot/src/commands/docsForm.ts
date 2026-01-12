import {
  EmbedBuilder,
  MessageFlags,
  SectionBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import { createCommand } from '../utils/botCommand.js'
import { type AlgoliaSearchResult } from '../infrastructure/search/algoliaSearch.js'
import {
  frameworkOptions,
  getFrameworkCommandChoices,
} from '../infrastructure/frameworks.js'
import { getProjectPath } from '../utils/paths.js'
import { readFileSync } from 'node:fs'
import { createDocsContainer } from '../utils/container.js'

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
    const mockPath = getProjectPath('../mockAlgolia.json')
    const result = JSON.parse(
      readFileSync(mockPath, 'utf-8'),
    ) as AlgoliaSearchResult

    const firstResult = result.results[0]
    if ('hits' in firstResult) {
      await interaction.reply({
        components: [createDocsContainer(firstResult.hits[0])],
        flags: MessageFlags.IsComponentsV2,
      })
    }

    // const res = await algoliaSearch({
    //   query: interaction.options.getString('query', true),

    //   // category: 'form',
    // })
  },
  autocomplete: async (interaction) => {
    await interaction.respond([
      {
        name: 'API Call to Algolia here',
        value: interaction.options.getFocused(),
      },
    ])
  },
})
