// Module-level cache for the current user's uploaded avatar (which is no
// longer carried in the JWT — see src/lib/auth.ts). Multiple components
// (Header, Sidebar, SettingsClient) read this; they share one fetch per
// page load. Reset on upload/remove via setCachedUserAvatar / clearUserAvatarCache.

let cached: string | null | undefined = undefined
let inflight: Promise<string | null> | null = null

export async function getCachedUserAvatar(): Promise<string | null> {
  if (cached !== undefined) return cached
  if (inflight) return inflight
  inflight = (async () => {
    try {
      const res = await fetch('/api/user/avatar', { cache: 'no-store' })
      if (!res.ok) {
        cached = null
        return null
      }
      const json = (await res.json()) as { image?: string | null }
      cached = json.image ?? null
      return cached
    } catch {
      cached = null
      return null
    } finally {
      inflight = null
    }
  })()
  return inflight
}

export function setCachedUserAvatar(image: string | null): void {
  cached = image
}

export function clearUserAvatarCache(): void {
  cached = undefined
}
