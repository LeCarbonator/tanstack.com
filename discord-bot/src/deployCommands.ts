import { logger } from './logging.js'
import { getCommands } from './utils/botCommand.js'
import { REST, Routes } from 'discord.js'
import { config, env } from './config.js'

async function deployCommands() {
  const rest = new REST().setToken(env.discordToken)
  const commands = await getCommands()
  logger.debug(
    `Loaded commands "${commands.map((c) => c.data.name).join('", "')}", pushing into deployment array.`,
  )

  const body = commands.map((c) => c.data.toJSON())
  try {
    logger.info(`Started refreshing ${body.length} application commands.`)

    const data = await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      {
        body,
      },
    )

    const hasLength = (d: unknown) =>
      Array.isArray(d) || (typeof d === 'object' && d !== null && 'length' in d)

    logger.info(
      `Successfully reloaded ${hasLength(data) ? data.length : ''} application commands.`,
    )
  } catch (error) {
    logger.error(error)
  }
}

deployCommands()
