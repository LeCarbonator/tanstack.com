import { SlashCommandBuilder } from 'discord.js'
import { createCommand } from '../utils/botCommand.js'

export default createCommand({
  data: new SlashCommandBuilder()
    .setName('docs')
    .setDescription('Display Tanstack documentation')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The phrase to search for')
        .setRequired(true),
    ),
  execute: async (interaction) => {
    await interaction.reply(
      'Documentation is available at https://tanstack.com/',
    )
  },
})
