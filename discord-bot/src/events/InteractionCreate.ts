import {
  AutocompleteInteraction,
  CommandInteraction,
  Events,
  type Interaction,
} from 'discord.js'
import { logger } from '../logging.js'
import { BotCommand } from '../utils/botCommand.js'
import { createEventHandler } from '../utils/eventHandler.js'

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

function notifyUserAboutIssue(interaction: Interaction) {
  if (!interaction.isRepliable()) return

  if (interaction.replied || interaction.deferred) {
    void interaction
      .editReply(
        '❌ An unexpected error occurred while processing this interaction.',
      )
      .catch(() => null)
  } else {
    void interaction
      .reply(
        '❌ An unexpected error occurred while processing this interaction.',
      )
      .catch(() => null)
  }
}

export default createEventHandler({
  name: Events.InteractionCreate,
  once: false,
  callback: async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName)

        if (!command) {
          missingCommandWarning(interaction)
          return void notifyUserAboutIssue(interaction)
        }

        logger.debug(`Executing command "${command.data.name}" (Slash command)`)
        void command.execute(interaction)
      } else if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName)

        if (!command) {
          missingCommandWarning(interaction)
          return void notifyUserAboutIssue(interaction)
        }

        if (command.autocomplete === undefined) {
          missingAutocompleteWarning(interaction, command)
          return void notifyUserAboutIssue(interaction)
        }

        logger.debug(`Autocompleting "${command.data.name}"`)
        void command.autocomplete(interaction)
      }
    } catch (error) {
      logger.error({
        command: 'commandName' in interaction ? interaction.commandName : null,
        interactionType: interaction.type,
        error,
      })
      void notifyUserAboutIssue(interaction)
    }
  },
})
