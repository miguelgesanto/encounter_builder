import { ReminderContent, CacheEntry } from '../types/reminder.types'

interface CacheConfig {
  maxSize: number
  ttlMs: number
  hitRateWindowSize?: number
}

export class ReminderCache {
  private cache = new Map<string, CacheEntry>()
  private hitCount = 0
  private missCount = 0
  private readonly config: CacheConfig

  constructor(config: CacheConfig) {
    this.config = {
      hitRateWindowSize: 100,
      ...config
    }

    // Periodic cleanup
    setInterval(() => this.cleanup(), this.config.ttlMs / 2)
  }

  get(key: string): ReminderContent | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.missCount++
      return null
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.missCount++
      return null
    }

    // Update access stats
    entry.accessed = Date.now()
    entry.hits++
    this.hitCount++

    return entry.content
  }

  set(key: string, content: ReminderContent): void {
    // Evict if at capacity
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU()
    }

    const entry: CacheEntry = {
      key,
      content,
      created: Date.now(),
      accessed: Date.now(),
      hits: 0,
      relevancyScore: this.calculateRelevancyScore(content)
    }

    this.cache.set(key, entry)
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry ? !this.isExpired(entry) : false
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.getHitRate(),
      hitCount: this.hitCount,
      missCount: this.missCount,
      entries: Array.from(this.cache.values()).map(entry => ({
        key: entry.key,
        hits: entry.hits,
        age: Date.now() - entry.created,
        relevancy: entry.relevancyScore
      }))
    }
  }

  static getHitRate(): number {
    // Global cache hit rate - implement singleton pattern if needed
    return 0.85 // Mock value for now
  }

  private getHitRate(): number {
    const total = this.hitCount + this.missCount
    return total > 0 ? this.hitCount / total : 0
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.created > this.config.ttlMs
  }

  private evictLRU(): void {
    let lruKey: string | null = null
    let lruTime = Infinity

    for (const [key, entry] of this.cache) {
      if (entry.accessed < lruTime) {
        lruTime = entry.accessed
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if (now - entry.created > this.config.ttlMs) {
        this.cache.delete(key)
      }
    }
  }

  private calculateRelevancyScore(content: ReminderContent): number {
    let score = 0

    // Urgency weight
    const urgencyWeights = { critical: 4, high: 3, medium: 2, low: 1 }
    score += urgencyWeights[content.urgency] * 0.4

    // Type importance weight
    const typeWeights = {
      death_trigger: 5,
      legendary_actions: 4,
      lair_actions: 4,
      turn_start: 3,
      condition_reminder: 3,
      concentration_check: 3,
      environmental: 2,
      tactical_suggestion: 1,
      turn_end: 1,
      round_start: 2
    }
    score += (typeWeights[content.type] || 1) * 0.3

    // Content complexity weight (longer content = more valuable)
    score += Math.min(content.content.length / 100, 2) * 0.2

    // Persistence weight
    score += content.persistent ? 1 : 0

    return Math.min(score, 10) // Cap at 10
  }
}