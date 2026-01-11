import { AutocompleteInteraction, CommandInteraction, Events } from 'discord.js'
import { createEventHandler } from '../utils/eventHandler.js'
import { logger } from '../logging.js'
import { BotCommand } from '../utils/botCommand.js'

function missingCommandWarning(
  interaction: CommandInteraction | AutocompleteInteraction,
) {
  logger.warn(
    `No command found for ${interaction.commandName}. Did you forget to update the deployments?`,
  )
}

function missingAutocompleteWarning(
  interaction: AutocompleteInteraction,
  command: BotCommand,
) {
  logger.warn(
    `Autocomplete interaction from ${interaction.commandName} cannot be applied on ${command.data.name} because it has no autocomplete callback.`,
  )
}

export default createEventHandler({
  name: Events.InteractionCreate,
  once: false,
  callback: async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)

      if (!command) {
        missingCommandWarning(interaction)
        return
      }

      logger.debug(`Executing command "${command.data.name}" (Slash command)`)
      void command.execute(interaction)
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName)

      if (!command) {
        missingCommandWarning(interaction)
        return
      }

      if (command.autocomplete === undefined) {
        missingAutocompleteWarning(interaction, command)
        return
      }

      logger.debug(`Autocompleting "${command.data.name}"`)
      void command.autocomplete(interaction)
    }
  },
})
