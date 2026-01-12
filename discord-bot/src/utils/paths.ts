import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const utilsFolderPath = path.dirname(__filename)

/**
 * The project's root directory.
 */
export const projectRoot = path.resolve(utilsFolderPath, '../')

export function getProjectPath(...segments: string[]) {
    return path.join(projectRoot, ...segments)
}

/**
 * The `commands` folder path.
 */
export const commandsFolderPath = getProjectPath('commands')

/**
 * The `config` folder path next to project root.
 */
export const configFolderPath = getProjectPath('../config')

/**
 * The `events` folder path.
 */
export const eventsFolderPath = getProjectPath('events')
