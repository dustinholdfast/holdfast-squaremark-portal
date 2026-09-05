/**
 * Cloudflare Pages Function: GET/PUT/PATCH /api/state
 *
 * Shared state bindings (prefer D1):
 *   - ENGAGEMENT_DB (D1) — preferred for Tommy/Dustin shared updates
 *   - ENGAGEMENT_STATE (KV) — optional fallback
 *
 * Local/dev without bindings: in-memory only (NOT shared across isolates).
 * Production MUST bind D1 or KV so AO and Holdfast see the same state.
 *
 * Writes require header x-admin-pin matching env ADMIN_PIN
 * (or Cloudflare Access email present — still requires pin for edits).
 */

type EvidenceStatus = 'Received' | 'Partial' | 'Missing' | 'N/A'
type MilestoneStatus = 'Upcoming' | 'In progress' | 'Complete' | 'Blocked'
type InterviewStatus = 'Proposed' | 'Scheduled' | 'Complete' | 'Canceled'

interface Engagement {
  client: string
  lead: string
  ao: string
  assessorNote: string
  scope: string
  weekLabel: string
  phases: { id: string; label: string }[]
  milestones: {
    id: string
    title: string
    description: string
    target: string
    status: MilestoneStatus
  }[]
  evidence: {
    id: string
    system: string
    item: string
    status: EvidenceStatus
    notes: string
  }[]
  interviews: {
    id: string
    title: string
    withWhom: string
    status: InterviewStatus
    when: string
    notes: string
  }[]
  clientUpdate: { text: string; postedAt: string } | null
  updatedAt: string
}

interface Env {
  ADMIN_PIN?: string
  ADMIN_EMAILS?: string
  ENGAGEMENT_DB?: D1Database
  ENGAGEMENT_STATE?: KVNamespace
}

const STATE_KEY = 'engagement'
const D1_TABLE = 'engagement_state'

// In-memory fallback for local Pages Functions only — not durable or shared.
let memoryState: Engagement | null = null

function seed(): Engagement {
  const now = new Date().toISOString()
  return {
    client: 'SquareMark',
    lead: 'Dustin Perkins',
    ao: 'Tommy Hendler',
    assessorNote:
      'Louis is the CSF assessor; content and scoring stay with him. This portal tracks progress and evidence collection only — no scores, no CUI.',
    scope:
      'Remote Corporate IT (~2 staff). Systems in scope for evidence collection: Cloudflare, Microsoft 365, Github, Stripe, Zoho. No CUI in this application.',
    weekLabel: 'Week 1',
    phases: [
      { id: 'W0', label: 'W0 · Prep' },
      { id: 'W1', label: 'W1 · Kickoff & evidence' },
      { id: 'W2', label: 'W2 · Org profile' },
      { id: 'W3', label: 'W3 · Assessment drafting' },
      { id: 'W4', label: 'W4 · Briefing & roadmap' },
      { id: 'W5', label: 'W5 · Close & attestations' },
    ],
    milestones: [
      {
        id: 'D1',
        title: 'D1 · Kickoff pack',
        description:
          'Kickoff materials, access requests, and engagement rhythm confirmed with AO.',
        target: 'Week 1',
        status: 'In progress',
      },
      {
        id: 'D2',
        title: 'D2 · Org Profile workbook',
        description: 'Organizational profile workbook inputs from SquareMark IT.',
        target: 'Week 2 / TBD',
        status: 'Upcoming',
      },
      {
        id: 'D3',
        title: 'D3 · Report',
        description: 'Draft CSF progress report (assessor-owned content).',
        target: 'TBD',
        status: 'Upcoming',
      },
      {
        id: 'D4',
        title: 'D4 · Exec briefing',
        description: 'Executive briefing on findings and next steps.',
        target: 'TBD',
        status: 'Upcoming',
      },
      {
        id: 'D5',
        title: 'D5 · Roadmap',
        description: 'Prioritized remediation / maturity roadmap.',
        target: 'TBD',
        status: 'Upcoming',
      },
      {
        id: 'D6',
        title: 'D6 · Attestations',
        description: 'Attestation and close-out artifacts.',
        target: 'TBD',
        status: 'Upcoming',
      },
    ],
    evidence: [
      {
        id: 'ev-m365-admin',
        system: 'Microsoft 365',
        item: 'M365 admin / Global Admin contact',
        status: 'Partial',
        notes: 'Name pending; mailbox identified',
      },
      {
        id: 'ev-m365-ca',
        system: 'Microsoft 365',
        item: 'Conditional Access overview (policies list / export)',
        status: 'Missing',
        notes: 'Need read access or screenshots of CA policies',
      },
      {
        id: 'ev-cf-zone',
        system: 'Cloudflare',
        item: 'Cloudflare zone access (DNS / WAF overview)',
        status: 'Missing',
        notes: 'Invite Holdfast or share zone summary',
      },
      {
        id: 'ev-gh-owners',
        system: 'Github',
        item: 'Github org owners / admin list',
        status: 'Partial',
        notes: 'Org known; owner confirmation pending',
      },
      {
        id: 'ev-stripe-owner',
        system: 'Stripe',
        item: 'Stripe dashboard owner / billing admin',
        status: 'Missing',
        notes: '',
      },
      {
        id: 'ev-zoho-admin',
        system: 'Zoho',
        item: 'Zoho admin contact and org ID',
        status: 'Missing',
        notes: '',
      },
      {
        id: 'ev-net-diagram',
        system: 'Network',
        item: 'Network / remote-access diagram',
        status: 'N/A',
        notes: 'Remote IT; diagram may not apply — confirm with AO',
      },
      {
        id: 'ev-asset-list',
        system: 'Inventory',
        item: 'Remote endpoint / laptop inventory snapshot',
        status: 'Missing',
        notes: 'High-level count + MDM status if any',
      },
      {
        id: 'ev-backup',
        system: 'Microsoft 365',
        item: 'Backup / retention posture note (Exchange/SharePoint)',
        status: 'Missing',
        notes: '',
      },
      {
        id: 'ev-interview-slots',
        system: 'Engagement',
        item: 'Interview availability windows (AO + IT)',
        status: 'Partial',
        notes: 'Two proposed slots below',
      },
    ],
    interviews: [
      {
        id: 'int-1',
        title: 'AO kickoff / scope confirm',
        withWhom: 'Tommy Hendler',
        status: 'Scheduled',
        when: 'Week 1 · TBD time',
        notes: 'Confirm systems list and access path',
      },
      {
        id: 'int-2',
        title: 'IT controls walkthrough (M365 / Cloudflare)',
        withWhom: 'SquareMark IT',
        status: 'Proposed',
        when: 'Week 1–2 · TBD',
        notes: 'Conditional Access + Cloudflare zone',
      },
      {
        id: 'int-3',
        title: 'SaaS admin touchpoint (Github / Stripe / Zoho)',
        withWhom: 'SquareMark IT',
        status: 'Proposed',
        when: 'Week 2 · TBD',
        notes: '',
      },
    ],
    clientUpdate: {
      text: 'Week 1 underway. Kickoff pack in progress. Please confirm M365 Conditional Access export path and Cloudflare zone access for Holdfast.',
      postedAt: now,
    },
    updatedAt: now,
  }
}

async function ensureD1(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS ${D1_TABLE} (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    )
    .run()
}

async function loadState(env: Env): Promise<Engagement> {
  if (env.ENGAGEMENT_DB) {
    await ensureD1(env.ENGAGEMENT_DB)
    const row = await env.ENGAGEMENT_DB.prepare(
      `SELECT payload FROM ${D1_TABLE} WHERE id = ?`,
    )
      .bind(STATE_KEY)
      .first<{ payload: string }>()
    if (row?.payload) {
      return JSON.parse(row.payload) as Engagement
    }
    const s = seed()
    await env.ENGAGEMENT_DB.prepare(
      `INSERT INTO ${D1_TABLE} (id, payload, updated_at) VALUES (?, ?, ?)`,
    )
      .bind(STATE_KEY, JSON.stringify(s), s.updatedAt)
      .run()
    return s
  }

  if (env.ENGAGEMENT_STATE) {
    const raw = await env.ENGAGEMENT_STATE.get(STATE_KEY)
    if (raw) return JSON.parse(raw) as Engagement
    const s = seed()
    await env.ENGAGEMENT_STATE.put(STATE_KEY, JSON.stringify(s))
    return s
  }

  if (!memoryState) memoryState = seed()
  return memoryState
}

async function saveState(env: Env, eng: Engagement): Promise<Engagement> {
  const next = { ...eng, updatedAt: new Date().toISOString() }

  if (env.ENGAGEMENT_DB) {
    await ensureD1(env.ENGAGEMENT_DB)
    await env.ENGAGEMENT_DB.prepare(
      `INSERT INTO ${D1_TABLE} (id, payload, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
    )
      .bind(STATE_KEY, JSON.stringify(next), next.updatedAt)
      .run()
    return next
  }

  if (env.ENGAGEMENT_STATE) {
    await env.ENGAGEMENT_STATE.put(STATE_KEY, JSON.stringify(next))
    return next
  }

  memoryState = next
  return next
}

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, PUT, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-pin',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  }
}

function authorizeWrite(request: Request, env: Env): Response | null {
  const accessEmail = (request.headers.get('Cf-Access-Authenticated-User-Email') || '').toLowerCase()
  const allow = (env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  if (accessEmail && allow.includes(accessEmail)) return null
  const pin = request.headers.get('x-admin-pin') || ''
  const expected = env.ADMIN_PIN || 'change-me'
  if (pin !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders(request),
    })
  }
  return null
}

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const eng = await loadState(context.env)
  return new Response(JSON.stringify(eng), {
    status: 200,
    headers: corsHeaders(context.request),
  })
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const denied = authorizeWrite(context.request, context.env)
  if (denied) return denied
  let body: Engagement
  try {
    body = (await context.request.json()) as Engagement
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: corsHeaders(context.request),
    })
  }
  const saved = await saveState(context.env, body)
  return new Response(JSON.stringify(saved), {
    status: 200,
    headers: corsHeaders(context.request),
  })
}

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const denied = authorizeWrite(context.request, context.env)
  if (denied) return denied
  let patch: Partial<Engagement>
  try {
    patch = (await context.request.json()) as Partial<Engagement>
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: corsHeaders(context.request),
    })
  }
  const current = await loadState(context.env)
  const merged = { ...current, ...patch } as Engagement
  const saved = await saveState(context.env, merged)
  return new Response(JSON.stringify(saved), {
    status: 200,
    headers: corsHeaders(context.request),
  })
}
