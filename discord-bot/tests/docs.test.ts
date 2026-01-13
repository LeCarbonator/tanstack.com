import { describe, expect, it } from 'vitest'
import commands from '../src/commands/docs.js'

describe('docs commands', () => {
  it('should not error during serialization', () => {
    for (const command of commands) {
      expect(() => command.data.toJSON()).not.toThrow()
    }
  })
})
