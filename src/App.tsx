import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadEngagement, saveEngagement } from './api'
import { computeProgress, needsFromYou } from './progress'
import { DEFAULT_ADMIN_PIN_HINT } from './seed'
import type {
  Engagement,
  EvidenceStatus,
  InterviewStatus,
  MilestoneStatus,
} from './types'

const EVIDENCE_STATUSES: EvidenceStatus[] = [
  'Received',
  'Partial',
  'Missing',
  'N/A',
]
const MILESTONE_STATUSES: MilestoneStatus[] = [
  'Upcoming',
  'In progress',
  'Complete',
  'Blocked',
]
const INTERVIEW_STATUSES: InterviewStatus[] = [
  'Proposed',
  'Scheduled',
  'Complete',
  'Canceled',
]

function statusTone(status: string): string {
  switch (status) {
    case 'Received':
    case 'Complete':
      return 'text-ok border-ok/40 bg-ok/10'
    case 'Partial':
    case 'In progress':
    case 'Scheduled':
      return 'text-warn border-warn/40 bg-warn/10'
    case 'Missing':
    case 'Blocked':
      return 'text-miss border-miss/40 bg-miss/10'
    case 'N/A':
    case 'Upcoming':
    case 'Proposed':
    case 'Canceled':
      return 'text-mute border-line bg-panel-2'
    default:
      return 'text-mute border-line bg-panel-2'
  }
}

function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium tracking-wide ${statusTone(status)}`}
    >
      {status}
    </span>
  )
}

function SelectAdmin<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T
  options: T[]
  onChange: (v: T) => void
  disabled?: boolean
}) {
  if (disabled) return <Badge status={value} />
  return (
    <select
      className="rounded border border-line bg-ink px-2 py-1 text-sm text-paper"
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

export default function App() {
  const [eng, setEng] = useState<Engagement | null>(null)
  const [source, setSource] = useState<'api' | 'local'>('local')
  const [demoBanner, setDemoBanner] = useState(true)
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [adminPin, setAdminPin] = useState('')
  const [updateDraft, setUpdateDraft] = useState('')
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const result = await loadEngagement()
      if (cancelled) return
      setEng(result.engagement)
      setSource(result.source)
      setDemoBanner(result.demoBanner)
      setUpdateDraft(result.engagement.clientUpdate?.text ?? '')
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const progress = useMemo(() => (eng ? computeProgress(eng) : 0), [eng])
  const needs = useMemo(() => (eng ? needsFromYou(eng) : []), [eng])

  const persist = useCallback(
    async (next: Engagement) => {
      setSaving(true)
      setSaveMsg(null)
      const result = await saveEngagement(next, adminPin, source)
      setSaving(false)
      if (!result.ok) {
        setSaveMsg(result.error || 'Save failed')
        return false
      }
      if (result.engagement) {
        setEng(result.engagement)
        setUpdateDraft(result.engagement.clientUpdate?.text ?? '')
      }
      setSaveMsg(source === 'api' ? 'Saved to shared state.' : 'Saved locally.')
      return true
    },
    [adminPin, source],
  )

  function tryUnlock() {
    const expected =
      import.meta.env.VITE_ADMIN_PIN || DEFAULT_ADMIN_PIN_HINT
    if (pinInput === expected) {
      setAdmin(true)
      setAdminPin(pinInput)
      setSaveMsg(null)
    } else {
      setSaveMsg('Incorrect PIN.')
    }
  }

  async function postUpdate() {
    if (!eng) return
    const next: Engagement = {
      ...eng,
      clientUpdate: {
        text: updateDraft.trim(),
        postedAt: new Date().toISOString(),
      },
    }
    await persist(next)
  }

  if (loading || !eng) {
    return (
      <div className="flex min-h-screen items-center justify-center text-mute">
        Loading SquareMark portal…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {demoBanner && (
        <div className="mb-4 rounded border border-brass/40 bg-brass/10 px-4 py-3 text-sm text-paper">
          Local demo — deploy with D1 (or KV) for shared updates between Tommy
          and Dustin. Edits here stay in this browser until{' '}
          <code className="text-brass">/api/state</code> is live.
        </div>
      )}

      <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brass">
            Holdfast · Client progress
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-paper">
            {eng.client}
          </h1>
          <p className="mt-2 text-sm text-mute">
            Lead {eng.lead} · AO {eng.ao} · {eng.weekLabel}
          </p>
          <p className="mt-1 max-w-2xl text-sm text-mute">{eng.scope}</p>
          <p className="mt-2 max-w-2xl text-xs text-brass-dim">{eng.assessorNote}</p>
        </div>
        <div className="rounded border border-line bg-panel px-5 py-4 text-right">
          <p className="text-xs uppercase tracking-wider text-mute">
            Progress (milestones + evidence)
          </p>
          <p className="text-4xl font-semibold text-brass">{progress}%</p>
          <p className="text-xs text-mute">Not a CSF score</p>
        </div>
      </header>

      <section className="mb-6 flex flex-wrap items-center gap-3 rounded border border-line bg-panel px-4 py-3">
        {admin ? (
          <>
            <span className="text-sm text-ok">Admin unlocked — edits enabled</span>
            <button
              type="button"
              className="rounded border border-line px-3 py-1 text-sm text-mute hover:border-brass hover:text-brass"
              onClick={() => {
                setAdmin(false)
                setAdminPin('')
                setPinInput('')
              }}
            >
              Lock
            </button>
            {saving && <span className="text-xs text-mute">Saving…</span>}
            {saveMsg && <span className="text-xs text-brass">{saveMsg}</span>}
          </>
        ) : (
          <>
            <span className="text-sm text-mute">View-only (Tommy)</span>
            <input
              type="password"
              placeholder="Admin PIN"
              className="rounded border border-line bg-ink px-3 py-1.5 text-sm"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
            />
            <button
              type="button"
              className="rounded border border-brass/50 bg-brass/15 px-3 py-1.5 text-sm text-brass hover:bg-brass/25"
              onClick={tryUnlock}
            >
              Unlock admin
            </button>
            {saveMsg && <span className="text-xs text-miss">{saveMsg}</span>}
          </>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-brass">
          Phases
        </h2>
        <div className="flex flex-wrap gap-2">
          {eng.phases.map((p) => (
            <span
              key={p.id}
              className={`rounded border px-3 py-1.5 text-sm ${
                p.id === 'W1'
                  ? 'border-brass text-brass bg-brass/10'
                  : 'border-line text-mute bg-panel'
              }`}
            >
              {p.label}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-brass">
          What we need from you
        </h2>
        <div className="rounded border border-line bg-panel p-4">
          {needs.length === 0 ? (
            <p className="text-sm text-ok">Nothing outstanding right now.</p>
          ) : (
            <ul className="list-inside list-disc space-y-2 text-sm text-paper">
              {needs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-brass">
          Client update
        </h2>
        <div className="rounded border border-line bg-panel p-4">
          {admin ? (
            <div className="space-y-3">
              <textarea
                className="min-h-24 w-full rounded border border-line bg-ink px-3 py-2 text-sm"
                value={updateDraft}
                onChange={(e) => setUpdateDraft(e.target.value)}
              />
              <button
                type="button"
                className="rounded border border-brass/50 bg-brass/15 px-3 py-1.5 text-sm text-brass"
                onClick={() => void postUpdate()}
              >
                Post update
              </button>
            </div>
          ) : eng.clientUpdate ? (
            <>
              <p className="text-sm leading-relaxed text-paper">
                {eng.clientUpdate.text}
              </p>
              <p className="mt-2 text-xs text-mute">
                Posted {new Date(eng.clientUpdate.postedAt).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-mute">No update posted yet.</p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-brass">
          Milestones D1–D6
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {eng.milestones.map((m, idx) => (
            <article
              key={m.id}
              className="rounded border border-line bg-panel p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-paper">{m.title}</h3>
                  <p className="mt-1 text-sm text-mute">{m.description}</p>
                  <p className="mt-2 text-xs text-brass-dim">Target: {m.target}</p>
                </div>
                <SelectAdmin
                  value={m.status}
                  options={MILESTONE_STATUSES}
                  disabled={!admin}
                  onChange={(status) => {
                    const milestones = eng.milestones.map((row, i) =>
                      i === idx ? { ...row, status } : row,
                    )
                    void persist({ ...eng, milestones })
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-brass">
          Evidence checklist
        </h2>
        <div className="overflow-x-auto rounded border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-panel-2 text-xs uppercase tracking-wider text-mute">
              <tr>
                <th className="px-3 py-2 font-medium">System</th>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {eng.evidence.map((row, idx) => (
                <tr key={row.id} className="border-t border-line bg-panel">
                  <td className="px-3 py-2 text-brass">{row.system}</td>
                  <td className="px-3 py-2">{row.item}</td>
                  <td className="px-3 py-2">
                    <SelectAdmin
                      value={row.status}
                      options={EVIDENCE_STATUSES}
                      disabled={!admin}
                      onChange={(status) => {
                        const evidence = eng.evidence.map((r, i) =>
                          i === idx ? { ...r, status } : r,
                        )
                        void persist({ ...eng, evidence })
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 text-mute">
                    {admin ? (
                      <input
                        className="w-full min-w-[12rem] rounded border border-line bg-ink px-2 py-1 text-sm text-paper"
                        value={row.notes}
                        onChange={(e) => {
                          const notes = e.target.value
                          setEng({
                            ...eng,
                            evidence: eng.evidence.map((r, i) =>
                              i === idx ? { ...r, notes } : r,
                            ),
                          })
                        }}
                        onBlur={() => void persist(eng)}
                      />
                    ) : (
                      row.notes || '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-brass">
          Interviews
        </h2>
        <div className="space-y-3">
          {eng.interviews.map((iv, idx) => (
            <article
              key={iv.id}
              className="flex flex-col gap-3 rounded border border-line bg-panel p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-medium">{iv.title}</h3>
                <p className="text-sm text-mute">
                  With {iv.withWhom} · {iv.when}
                </p>
                {iv.notes && (
                  <p className="mt-1 text-xs text-brass-dim">{iv.notes}</p>
                )}
              </div>
              <SelectAdmin
                value={iv.status}
                options={INTERVIEW_STATUSES}
                disabled={!admin}
                onChange={(status) => {
                  const interviews = eng.interviews.map((row, i) =>
                    i === idx ? { ...row, status } : row,
                  )
                  void persist({ ...eng, interviews })
                }}
              />
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-line pt-4 text-xs text-mute">
        View-only for Tommy · Holdfast updates statuses · No scores · No CUI ·
        No uploads · Hosted on Cloudflare Pages (not Vercel) · Updated{' '}
        {new Date(eng.updatedAt).toLocaleString()}
      </footer>
    </div>
  )
}
