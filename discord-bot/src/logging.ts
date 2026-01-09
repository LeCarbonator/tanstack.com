import pino from 'pino'
import { config, env } from './config.js'

export const logger = env.isProduction
  ? pino(
      {
        level: config.logLevel,
      },
      pino.destination({
        dest: 'logs/app.log',
        sync: false,
      }),
    )
  : pino({
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
        },
      },
    })

logger.info(`Logger initialized at level: ${config.logLevel}`)
