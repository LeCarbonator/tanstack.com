import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import z from 'zod'
import { logger } from '../logging.js'
import { commandsFolderPath } from './paths.js'

export interface BotCommand {
  data: SlashCommandBuilder
  execute: (interaction: ChatInputCommandInteraction) => any
}

export const botCommandSchema = z
  .object({
    data: z.instanceof(SlashCommandBuilder),
    execute: z.function(),
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

  for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file)
    const { default: command } = await import(`file://${filePath}`)

    const result = botCommandSchema.safeParse(command)

    if (result.success) {
      commands.push(result.data)
    } else {
      logger.warn(
        `Failed to load command at ${filePath} due to validation errors:\n${z.prettifyError(result.error)}`,
      )
    }
  }
  return commands
}
