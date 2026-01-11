import { ClientEvents } from 'discord.js'
import z from 'zod'

export interface EventHandler<TEvent extends keyof ClientEvents> {
  /**
   * The name of the event to listen to.
   */
  name: TEvent
  /**
   * Whether to only attach the event listener once.
   *
   * Examples include logging-related events like `ClientReady`.
   */
  once: boolean
  callback: (...args: ClientEvents[TEvent]) => Promise<void> | void
}

export const eventHandlerSchema = z
  .strictObject({
    name: z.string(),
    once: z.boolean(),
    callback: z.function(),
  })
  .transform((obj) => obj as EventHandler<keyof ClientEvents>)

export function createEventHandler<TEvent extends keyof ClientEvents>(
  eventHandler: EventHandler<TEvent>,
): EventHandler<TEvent> {
  return eventHandler
}
