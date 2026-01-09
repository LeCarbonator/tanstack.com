import { Events } from 'discord.js'
import { createEventHandler } from '../utils/eventHandler.js'
import { logger } from '../logging.js'

export default createEventHandler({
  name: Events.ClientReady,
  once: true,
  callback: (readyClient) => {
    logger.info(`Logged in as ${readyClient.user.tag}`)
  },
})
