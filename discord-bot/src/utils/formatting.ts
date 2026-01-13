import { type ApplicationCommandOptionChoiceData } from 'discord.js'
import {
  algoliaHierarchyKeys,
  type AlgoliaHit,
  type AlgoliaSearchResult,
} from '../infrastructure/search/algoliaSearch.js'
import { isFrameworkValue } from '../infrastructure/frameworks.js'
import { discordLimits } from '../infrastructure/discordApiConstants.js'

const AUTOCOMPLETE_PREFIX = 'docsSelect:'

function createAutocompleteValue(index: number): string {
  return `${AUTOCOMPLETE_PREFIX}${index}`
}

export function tryGetAutocompleteIndex(selectedValue: string): number | null {
  if (!selectedValue.startsWith(AUTOCOMPLETE_PREFIX)) {
    return null
  }

  const raw = selectedValue.slice(AUTOCOMPLETE_PREFIX.length)
  if (raw.length === 0) {
    return null
  }

  const index = Number(raw)

  // Ensure it is a valid, non-negative integer
  if (!Number.isInteger(index) || index < 0) {
    return null
  }

  return index
}

export function createAutocompleteChoices(
  result: AlgoliaSearchResult,
): ApplicationCommandOptionChoiceData<string>[] {
  const firstResult = result.results[0]

  if (!firstResult || !('hits' in firstResult)) {
    return []
  }

  return firstResult.hits.map<ApplicationCommandOptionChoiceData<string>>(
    (hit, index) => ({
      name: buildHierarchyLabel(hit, {
        maxSegments: 3,
        maxChars: discordLimits.choices.valueString,
        separator: ' > ',
      }),
      value: createAutocompleteValue(index),
    }),
  )
}

/**
 * Build a readable hierarchy label:
 * - Segments joined by " > "
 * - Drop hierarchy.lvl0 if shouldRemoveLvl0(lvl0) returns true
 * - At most 3 hierarchy elements
 * - Max 100 characters; if longer, shorten with ellipsis ("…")
 */
function buildHierarchyLabel(
  hit: Pick<AlgoliaHit, 'hierarchy'>,
  opts: {
    maxSegments?: 1 | 2 | 3 | 4 | 5 | 6
    maxChars: number
    separator: string
  },
): string {
  const maxSegments = opts?.maxSegments ?? 3
  const maxChars = opts.maxChars
  const separator = opts.separator

  const h = hit.hierarchy

  let parts = algoliaHierarchyKeys
    .map((k) => (typeof h[k] === 'string' ? h[k] : ''))
    .filter((v) => v.length > 0)

  const lvl0 = typeof h.lvl0 === 'string' ? h.lvl0 : ''
  if (lvl0 && isFrameworkValue(lvl0)) {
    parts = parts.slice(1)
  }

  if (parts.length > maxSegments) {
    parts = parts.slice(parts.length - maxSegments)
  }

  const label = parts.join(separator)
  return clampWithEllipsis(label, maxChars, separator)
}

/**
 * Clamp string to maxChars, using a single-character ellipsis (…).
 * Preserves as much as possible from the end when clamping hierarchy labels,
 * since the most specific part is usually at the end.
 */
function clampWithEllipsis(
  input: string,
  maxChars: number,
  separator: string,
): string {
  if (maxChars <= 0) return ''
  if (input.length <= maxChars) return input

  const ellipsis = '…'
  if (maxChars === 1) return ellipsis

  const available = maxChars - ellipsis.length
  if (available <= 0) return ellipsis

  // Prefer cutting on separator boundaries from the left
  const parts = input.split(separator)

  let tail = ''
  for (let i = parts.length - 1; i >= 0; i--) {
    const candidate = tail ? parts[i] + separator + tail : parts[i]

    if (candidate.length <= available) {
      tail = candidate
    } else {
      break
    }
  }

  // Fallback: hard cut if even the last segment is too large
  if (!tail) {
    tail = input.slice(input.length - available)
  }

  return `${ellipsis}${separator}${tail}`.slice(0, maxChars)
}
