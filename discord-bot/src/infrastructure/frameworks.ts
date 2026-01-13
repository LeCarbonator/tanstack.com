import type { APIApplicationCommandOptionChoice } from 'discord.js'

export interface Framework {
  label: string
  value: string
  emojiMarkdown: string
  color: number
}

export const frameworkOptions = [
  {
    label: 'React',
    value: 'react',
    emojiMarkdown: '<:react:1459919737206341692>',
    color: 0x2b7fff,
  },
  {
    label: 'Preact',
    value: 'preact',
    emojiMarkdown: '<:preact:1459926210049081444>',
    color: 0xad46ff,
  },
  {
    label: 'Vue',
    value: 'vue',
    emojiMarkdown: '<:vue:1459919735532818433>',
    color: 0x00c951,
  },
  {
    label: 'Angular',
    value: 'angular',
    emojiMarkdown: '<:angular:1459919730717491302>',
    color: 0xfb2c36,
  },
  {
    label: 'Solid',
    value: 'solid',
    emojiMarkdown: '<:solid:1459919733741584567>',
    color: 0x155dfc,
  },
  {
    label: 'Lit',
    value: 'lit',
    emojiMarkdown: '<:lit:1459919727416574206>',
    color: 0x00bc7d,
  },
  {
    label: 'Svelte',
    value: 'svelte',
    emojiMarkdown: '<:svelte:1459919732168855614>',
    color: 0xf54a00,
  },
  {
    label: 'Qwik',
    value: 'qwik',
    emojiMarkdown: '<:qwik:1459924181708705961>',
    color: 0x615fff,
  },
  {
    label: 'Vanilla',
    value: 'vanilla',
    emojiMarkdown: '<:vanilla:1459924183818567916>',
    color: 0xefb100,
  },
  {
    label: 'Core',
    value: 'all',
    emojiMarkdown: '🏝️',
    color: 0xe6e6e,
  },
] as const satisfies Framework[]

export type FrameworkValue = (typeof frameworkOptions)[number]['value']

export function isFrameworkValue(value: string): value is FrameworkValue {
  return tryGetFramework(value) !== null
}

export function tryGetFramework(
  value: string | null | undefined,
): Framework | null {
  if (typeof value !== 'string') return null

  return frameworkOptions.find((f) => f.value === value) ?? null
}

/**
 * Get a list of framework options, formatted to be used in Discord slash command choices.
 * @param frameworks An array of framework values to include. If null, includes all frameworks.
 */
export function getFrameworkCommandChoices<T extends Array<FrameworkValue>>(
  frameworks: T | null,
): APIApplicationCommandOptionChoice<string>[] {
  return frameworkOptions
    .filter((f) =>
      frameworks === null ? true : frameworks.includes(f.value as never),
    )
    .map((f) => ({
      name: f.label,
      value: f.value,
    }))
}

export type TanStackLibrary =
  | 'form'
  | 'start'
  | 'router'
  | 'query'
  | 'table'
  | 'db'
  | 'ai'
  | 'virtual'
  | 'pacer'
  | 'store'
  | 'devtools'

export function getTanStackLibraryLabel(library: TanStackLibrary): string {
  const libraryLabels: Record<TanStackLibrary, string> = {
    form: 'Form',
    ai: 'AI',
    db: 'DB',
    devtools: 'Devtools',
    pacer: 'Pacer',
    query: 'Query',
    router: 'Router',
    start: 'Start',
    store: 'Store',
    table: 'Table',
    virtual: 'Virtual',
  }

  return libraryLabels[library]
}
