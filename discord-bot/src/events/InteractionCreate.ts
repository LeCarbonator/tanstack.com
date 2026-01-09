import { Events } from 'discord.js'
import { createEventHandler } from '../utils/eventHandler.js'
import { logger } from '../logging.js'

export default createEventHandler({
  name: Events.InteractionCreate,
  once: false,
  callback: async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
      logger.warn(
        `No command found for ${interaction.commandName}. Did you forget to update the deployments?`,
      )
      return
    }

    command.execute(interaction)
  },
})
