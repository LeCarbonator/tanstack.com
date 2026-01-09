import 'dotenv/config'
import { z } from 'zod'
import fs from 'node:fs'
import path from 'node:path'
import { configFolderPath } from './utils/paths.js'

const envSchema = z
  .object({
    NODE_ENV: z.enum(
      ['development', 'production'],
      'NODE_ENV must be either development or production',
    ),

    DISCORD_TOKEN: z
      .string()
      .min(
        1,
        'Token is required - Your discord token from the discord developer portal',
      ),
  })
  .transform((env) => ({
    /**
     * The node environment
     */
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    /**
     * Your discord token from the discord developer portal
     */
    discordToken: env.DISCORD_TOKEN,
  }))

const configSchema = z.object({
  // Reflects pino's default log levels
  logLevel: z.enum([
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
    'silent',
  ]),
  clientId: z.string().min(1),
  guildId: z.string().min(1),
})

/**
 * Validate that environment variables are set correctly
 */
function validateEnv(): Readonly<z.output<typeof envSchema>> {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        'Failed to parse environment variables: \n',
        z.prettifyError(error),
      )
    } else if (error instanceof Error) {
      console.error('Failed to parse environment variables:', error.message)
    } else {
      console.error(
        'An unknown error occurred while parsing environment variables.',
      )
    }
    process.exit(1)
  }
}

/**
 * Load the config JSON and validate it
 */
function loadConfig(): Readonly<z.output<typeof configSchema>> {
  const env =
    process.env.NODE_ENV === 'production' ? 'production' : 'development'
  const filePath = path.resolve(configFolderPath, `config.${env}.json`)

  if (!fs.existsSync(filePath)) {
    console.error(`Config file not found: ${filePath}`)
    process.exit(1)
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    return configSchema.parse(parsed)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Failed to parse ${filePath}:\n`, z.prettifyError(error))
    } else if (error instanceof Error) {
      console.error(`Failed to parse ${filePath}:`, error.message)
    } else {
      console.error(
        `An unknown error occurred while parsing ${filePath}:\n`,
        error,
      )
    }
    process.exit(1)
  }
}

export const env = validateEnv()
export const config = loadConfig()
