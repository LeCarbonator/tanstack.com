import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const utilsFolderPath = path.dirname(__filename)

/**
 * The project's root directory.
 */
export const projectRoot = path.resolve(utilsFolderPath, '../')

/**
 * The `commands` folder path.
 */
export const commandsFolderPath = path.join(projectRoot, 'commands')

/**
 * The `config` folder path next to project root.
 */
export const configFolderPath = path.join(projectRoot, '../config')

/**
 * The `events` folder path.
 */
export const eventsFolderPath = path.join(projectRoot, 'events')
