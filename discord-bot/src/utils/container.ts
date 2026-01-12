import { ContainerBuilder, heading, HeadingLevel, hyperlink } from 'discord.js'
import type { AlgoliaHit } from '../infrastructure/search/algoliaSearch.js'
import {
  tryGetFramework,
  type Framework,
} from '../infrastructure/frameworks.js'

function getVersionLabel(hit: AlgoliaHit) {
  if (typeof hit.version !== 'string') {
    return '\u200b'
  }
  return `version: ${hit.version}`
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

  if (framework?.emojiMarkdown) {
    first = `${framework.emojiMarkdown} ${first}`
  }

  const firstHeader = first ? heading(hyperlink(first, hit.url)) : null
  const secondHeader = second ? heading(second, HeadingLevel.Two) : null
  const thirdHeader = third ? heading(third, HeadingLevel.Three) : null

  const items = [firstHeader, secondHeader, thirdHeader].filter(
    (v) => v !== null,
  )

  return [framework, items.join('\n')]
}

export function createDocsContainer(hit: AlgoliaHit): ContainerBuilder {
  const [framework, header] = parseAlgoliaHit(hit)

  const footer = getVersionLabel(hit)

  let container = new ContainerBuilder()
    .setAccentColor(framework?.color)
    .addTextDisplayComponents((text) => text.setContent(header))

  if (hit.content) {
    container = container
      .addTextDisplayComponents((text) => text.setContent(hit.content!))
      .addSeparatorComponents((s) => s.setDivider(true))
  }

  return container.addTextDisplayComponents((text) => text.setContent(footer))
}
