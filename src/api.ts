import { createSeedEngagement, STORAGE_KEY } from './seed'
import type { Engagement } from './types'

export type LoadResult = {
  engagement: Engagement
  source: 'api' | 'local'
  demoBanner: boolean
}

async function fetchApi(): Promise<Engagement | null> {
  try {
    const res = await fetch('/api/state', { credentials: 'same-origin' })
    if (!res.ok) return null
    return (await res.json()) as Engagement
  } catch {
    return null
  }
}

function readLocal(): Engagement {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Engagement
  } catch {
    /* ignore */
  }
  const seed = createSeedEngagement()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  return seed
}

function writeLocal(eng: Engagement): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(eng))
}

export async function loadEngagement(): Promise<LoadResult> {
  const fromApi = await fetchApi()
  if (fromApi) {
    return { engagement: fromApi, source: 'api', demoBanner: false }
  }
  return {
    engagement: readLocal(),
    source: 'local',
    demoBanner: true,
  }
}

export async function saveEngagement(
  eng: Engagement,
  adminPin: string,
  source: 'api' | 'local',
): Promise<{ ok: boolean; error?: string; engagement?: Engagement }> {
  const next = { ...eng, updatedAt: new Date().toISOString() }
  if (source === 'api') {
    try {
      const res = await fetch('/api/state', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin,
        },
        credentials: 'same-origin',
        body: JSON.stringify(next),
      })
      if (!res.ok) {
        const text = await res.text()
        return { ok: false, error: text || `Save failed (${res.status})` }
      }
      const saved = (await res.json()) as Engagement
      return { ok: true, engagement: saved }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Network error' }
    }
  }
  writeLocal(next)
  return { ok: true, engagement: next }
}

export async function verifyAdminPin(adminPin: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/state', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin,
      },
      credentials: 'same-origin',
      body: JSON.stringify({}),
    })
    if (res.ok) return { ok: true }
    if (res.status === 401) return { ok: false, error: 'Incorrect PIN.' }
    return { ok: false, error: `Unlock failed (${res.status})` }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' }
  }
}

