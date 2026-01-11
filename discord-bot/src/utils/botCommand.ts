import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import z from 'zod'
import { logger } from '../logging.js'
import { commandsFolderPath } from './paths.js'

type AnySlashCommandBuilder =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder

export interface BotCommand {
  data: AnySlashCommandBuilder
  execute: (interaction: ChatInputCommandInteraction) => any
  autocomplete?: (interaction: AutocompleteInteraction) => any
}

export const botCommandSchema = z
  .strictObject({
    data: z.instanceof(SlashCommandBuilder),
    execute: z.function(),
    autocomplete: z.function().optional(),
  })
  .transform((obj) => obj as BotCommand)

export function createCommand(command: BotCommand): BotCommand {
  return command
}

export async function getCommands(): Promise<BotCommand[]> {
  const commands: BotCommand[] = []

  const foldersPath = commandsFolderPath
  const commandFiles = fs
    .readdirSync(foldersPath)
    .filter((file) => file.endsWith('.js'))

  let hasFailed = false

  for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file)
    const { default: command } = await import(`file://${filePath}`)

    const result = botCommandSchema.safeParse(command)

    if (result.success) {
      commands.push(result.data)
    } else {
      logger.error(
        `Failed to load command at ${filePath} due to validation errors:\n${z.prettifyError(result.error)}`,
      )
      hasFailed = true
    }
  }

  if (hasFailed) {
    process.exit(1)
  }

  return commands
}
