import { ContainerBuilder, heading, HeadingLevel, hyperlink } from 'discord.js'
import {
  tryGetFramework,
  type Framework,
} from '../infrastructure/frameworks.js'
import type {
  AlgoliaHit,
  TanStackLibrary,
} from '../infrastructure/search/algoliaSearch.js'
import { libraryLabels } from './constants.js'

function getFooter(
  hit: AlgoliaHit,
  framework: Framework | null,
  library: TanStackLibrary,
) {
  if (typeof hit.version !== 'string') {
    return '\u200b'
  }
  const emoji = framework?.emojiMarkdown ? framework.emojiMarkdown + ' ' : ''
  return `${emoji}${libraryLabels[library]} (${hit.version})`
}

function parseAlgoliaHit(
  hit: AlgoliaHit,
): [framework: Framework | null, headers: string] {
  const framework = tryGetFramework(hit.hierarchy.lvl0)

  let { lvl0: first, lvl1: second, lvl2: third } = hit.hierarchy

  if (first && first === framework?.value) {
    first = second
    second = third
    third = hit.hierarchy.lvl3
  }

  const firstHeader = first ? heading(hyperlink(first, hit.url)) : null
  const secondHeader = second ? heading(second, HeadingLevel.Two) : null
  const thirdHeader = third ? heading(third, HeadingLevel.Three) : null

  const items = [firstHeader, secondHeader, thirdHeader].filter(
    (v) => v !== null,
  )

  return [framework, items.join('\n')]
}

export function createAlgoliaDocsContainer(
  hit: AlgoliaHit,
  library: TanStackLibrary,
  fallbackColor?: number,
): [ContainerBuilder] {
  const [framework, header] = parseAlgoliaHit(hit)

  const footer = getFooter(hit, framework, library)

  let container = new ContainerBuilder()
    .setAccentColor(framework?.color ?? fallbackColor)
    .addTextDisplayComponents((text) => text.setContent(header))

  if (hit.content) {
    container = container.addTextDisplayComponents((text) =>
      text.setContent(hit.content!),
    )
  }

  return [
    container
      .addSeparatorComponents((s) => s.setDivider(true))
      .addTextDisplayComponents((text) => text.setContent(footer)),
  ]
}
