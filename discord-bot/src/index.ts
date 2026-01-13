import { Client, Collection, GatewayIntentBits } from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import z from 'zod'
import { env } from './config.js'
import { logger } from './logging.js'
import { getCommands } from './utils/botCommand.js'
import { eventHandlerSchema } from './utils/eventHandler.js'
import { eventsFolderPath } from './utils/paths.js'

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
})

const eventFiles = fs
  .readdirSync(eventsFolderPath)
  .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
  const filePath = path.join(eventsFolderPath, file)
  const { default: event } = await import(`file://${filePath}`)
  const result = eventHandlerSchema.safeParse(event)

  if (result.success) {
    logger.debug(
      `Attaching event handler "${result.data.name}" (mode: ${result.data.once ? 'once' : 'on'})`,
    )

    if (result.data.once) {
      client.once(result.data.name, (...args) => result.data.callback(...args))
    } else {
      client.on(result.data.name, (...args) => result.data.callback(...args))
    }
  } else {
    logger.warn(
      `Failed to attach event in ${filePath} due to validation errors:\n${z.prettifyError(result.error)}`,
    )
  }
}

client.commands = new Collection()

getCommands().then((commands) => {
  for (const command of commands) {
    client.commands.set(command.data.name, command)
  }
  logger.debug(
    `Registered commands "${commands.map((c) => c.data.name).join('", "')}" in client's command collection.`,
  )
})

logger.info('Logging in client to Discord...')
client.login(env.discordToken)
