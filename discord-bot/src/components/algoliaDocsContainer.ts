import {
  bold,
  ButtonStyle,
  ContainerBuilder,
  heading,
  HeadingLevel,
  hyperlink,
  subtext,
  TextDisplayBuilder,
  type User,
} from 'discord.js'
import {
  getTanStackLibraryLabel,
  tryGetFramework,
  type Framework,
  type TanStackLibrary,
} from '../infrastructure/frameworks.js'
import type { AlgoliaHit } from '../infrastructure/search/algoliaSearch.js'

function getFooter(
  hit: AlgoliaHit,
  framework: Framework | null,
  library: TanStackLibrary,
) {
  if (typeof hit.version !== 'string') {
    return '\u200b'
  }
  const emoji = framework?.emojiMarkdown ? framework.emojiMarkdown + ' ' : ''
  return `${emoji}${getTanStackLibraryLabel(library)} (${hit.version})`
}

function parseAlgoliaHit(
  hit: AlgoliaHit,
): [framework: Framework | null, headers: string] {
  const framework = tryGetFramework(hit.hierarchy.lvl0)

  const headers = [
    hit.hierarchy.lvl0,
    hit.hierarchy.lvl1,
    hit.hierarchy.lvl2,
    hit.hierarchy.lvl3,
    hit.hierarchy.lvl4,
    hit.hierarchy.lvl5,
    hit.hierarchy.lvl6,
  ].filter((v) => v !== null)

  if (headers[0] && headers[0] === framework?.value) {
    headers.shift()
  }

  const [first, second, third, ...remaining] = headers

  let output = heading(hyperlink(first ?? 'Docs link', hit.url))

  if (second) {
    output += `\n ${heading(second, HeadingLevel.Two)}`
  }
  if (third) {
    output += `\n ${heading(third, HeadingLevel.Three)}`
  }
  if (remaining.length > 0) {
    output += `\n ${remaining.map(bold).join(' > ')}`
  }

  return [framework, output]
}

export interface AlgoliaDocsContainerParams {
  mention: User | null
  hit: AlgoliaHit
  library: TanStackLibrary
  fallbackColor?: number
}

export function createAlgoliaDocsContainer(
  params: AlgoliaDocsContainerParams,
): [ContainerBuilder] | [TextDisplayBuilder, ContainerBuilder] {
  const { hit, library, fallbackColor } = params
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

  container = container
    .addSeparatorComponents((s) => s.setDivider(true))
    .addSectionComponents((section) =>
      section
        .addTextDisplayComponents((text) => text.setContent(footer))
        .setButtonAccessory((button) =>
          button.setLabel('Docs').setStyle(ButtonStyle.Link).setURL(hit.url),
        ),
    )

  if (!params.mention) {
    return [container]
  }
  return [
    new TextDisplayBuilder().setContent(
      subtext(`Docs suggestion for ${params.mention}:`),
    ),
    container,
  ]
}
