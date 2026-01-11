import { SlashCommandBuilder } from 'discord.js'
import { createCommand } from '../utils/botCommand.js'
import { algoliaSearch } from '../infrastructure/search/algoliaSearch.js'

const data = new SlashCommandBuilder()
  .setName('docs-form')
  .setDescription('Display Tanstack Form documentation')
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
    await interaction.reply(
      `Documentation is available at https://tanstack.com/ \nYou requested: ${interaction.options.getString('query', true)}`,
    )

    const res = await algoliaSearch({
      query: interaction.options.getString('query', true),
      // category: 'form',
    })
    console.log(JSON.stringify(res, null, 2))
  },
  autocomplete: async (interaction) => {
    await interaction.respond([
      { name: 'API Call to Algolia here', value: 'Form Composition' },
    ])
  },
})
