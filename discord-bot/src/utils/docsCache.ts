import { AlgoliaSearchResult } from '../infrastructure/search/algoliaSearch.js'

export type CacheKey = string

interface CacheEntry<V> {
  value: V
  /**
   * epoch ms
   */
  expiresAt: number
  ttlMs: number
}

/**
 * A TTL cache for autocompleting documentation.
 */
export interface DocsCacheOptions {
  /**
   * Sweep interval in milliseconds.
   * */
  sweepIntervalMs: number
  /**
   * If true, calling get() will extend expiry by the original ttlMs (sliding expiration).
   * @default false (absolute expiration).
   */
  sliding: boolean
  /**
   * If true, calling has() will also extend expiry when `sliding: true`.
   * @default false.
   */
  slideOnHas?: boolean
}

/**
 * `${userId}~${commandName}`
 */
export type DocsCacheKey = `${string}~${string}`

export function createDocsCacheKey(
  userId: string,
  command: string,
): DocsCacheKey {
  return `${userId}~${command}`
}

export class DocsCache<TEntry> {
  private readonly store = new Map<DocsCacheKey, CacheEntry<TEntry>>()
  private readonly sweepIntervalMs: number
  private readonly sliding: boolean
  private readonly slideOnHas: boolean

  private sweeper: NodeJS.Timeout | null

  constructor(options: DocsCacheOptions) {
    this.sweepIntervalMs = options.sweepIntervalMs
    this.sliding = options.sliding
    this.slideOnHas = options.slideOnHas ?? false
    this.sweeper = null

    this.startSweeper()
  }

  /**
   * Insert or overwrite a value with the given TTL (in ms).
   * TTL must be > 0.
   */
  set(key: DocsCacheKey, value: TEntry, ttlMs: number): void {
    const actualTtlMs = Math.max(ttlMs, 0)
    const now = Date.now()

    this.store.set(key, {
      value,
      ttlMs: actualTtlMs,
      expiresAt: now + actualTtlMs,
    })
  }

  /**
   * Get a value if present and not expired. Returns undefined otherwise.
   * If sliding expiration is enabled, extends the TTL on successful get().
   */
  get(key: DocsCacheKey): TEntry | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined

    if (this.isExpired(entry)) {
      this.store.delete(key)
      return undefined
    }

    if (this.sliding) {
      entry.expiresAt = Date.now() + entry.ttlMs
    }

    return entry.value
  }

  /**
   * Returns true if present and not expired.
   * Optionally extends TTL when sliding=true and slideOnHas=true.
   */
  has(key: DocsCacheKey): boolean {
    const entry = this.store.get(key)
    if (!entry) return false

    if (this.isExpired(entry)) {
      this.store.delete(key)
      return false
    }

    if (this.sliding && this.slideOnHas) {
      entry.expiresAt = Date.now() + entry.ttlMs
    }

    return true
  }

  /**
   * Remove an entry explicitly.
   */
  delete(key: DocsCacheKey): boolean {
    return this.store.delete(key)
  }

  /**
   * Clear everything.
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Number of currently stored entries (may include some that will be swept soon).
   */
  size(): number {
    return this.store.size
  }

  /**
   * Force an immediate sweep. Returns number of evicted entries.
   */
  sweep(): void {
    const now = Date.now()

    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Stop the background sweeper (recommended on shutdown).
   */
  stopSweeper(): void {
    if (this.sweeper) {
      clearInterval(this.sweeper)
      this.sweeper = null
    }
  }

  /**
   * Restart the background sweeper if stopped.
   */
  startSweeper(): void {
    if (this.sweeper) return

    this.sweeper = setInterval(() => {
      this.sweep()
    }, this.sweepIntervalMs)

    // Prevent the sweeper from keeping nodejs alive
    this.sweeper.unref()
  }

  private isExpired(entry: CacheEntry<TEntry>): boolean {
    return entry.expiresAt <= Date.now()
  }
}

export const docsCache = new DocsCache<AlgoliaSearchResult>({
  sweepIntervalMs: 30_000,
  sliding: true,
})
