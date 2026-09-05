import type { Engagement, EvidenceStatus, MilestoneStatus } from './types'

const milestoneWeight: Record<MilestoneStatus, number> = {
  Complete: 1,
  'In progress': 0.5,
  Blocked: 0.25,
  Upcoming: 0,
}

const evidenceWeight: Record<EvidenceStatus, number> = {
  Received: 1,
  Partial: 0.5,
  'N/A': 1,
  Missing: 0,
}

/** Progress from milestone + evidence completion weights — not a CSF score. */
export function computeProgress(eng: Engagement): number {
  const mScores = eng.milestones.map((m) => milestoneWeight[m.status])
  const eScores = eng.evidence.map((e) => evidenceWeight[e.status])
  const mAvg = mScores.length ? mScores.reduce((a, b) => a + b, 0) / mScores.length : 0
  const eAvg = eScores.length ? eScores.reduce((a, b) => a + b, 0) / eScores.length : 0
  return Math.round((mAvg * 0.55 + eAvg * 0.45) * 100)
}

export function needsFromYou(eng: Engagement): string[] {
  const items: string[] = []
  for (const row of eng.evidence) {
    if (row.status === 'Missing' || row.status === 'Partial') {
      const note = row.notes ? ` — ${row.notes}` : ''
      items.push(`${row.system}: ${row.item}${note}`)
    }
  }
  for (const iv of eng.interviews) {
    if (iv.status === 'Proposed') {
      items.push(`Confirm interview: ${iv.title} (${iv.withWhom}) — ${iv.when}`)
    }
  }
  return items
}
