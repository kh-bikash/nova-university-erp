// Redis is disabled as per user request.
// Using a simple in-memory map for basic caching if needed, or just no-op.

const memoryCache = new Map<string, { value: any; expiry: number }>()

export async function getCache<T>(key: string): Promise<T | null> {
    const cached = memoryCache.get(key)
    if (cached) {
        if (Date.now() > cached.expiry) {
            memoryCache.delete(key)
            return null
        }
        return cached.value as T
    }
    return null
}

export async function setCache(key: string, data: any, ttlSeconds: number = 300) {
    memoryCache.set(key, {
        value: data,
        expiry: Date.now() + ttlSeconds * 1000,
    })
}

export async function deleteCache(key: string) {
    memoryCache.delete(key)
}

export async function invalidateCache(pattern: string) {
    // Simple prefix match for memory cache
    const prefix = pattern.replace('*', '')
    for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
            memoryCache.delete(key)
        }
    }
}

export function getRedisClient() {
    return null
}
