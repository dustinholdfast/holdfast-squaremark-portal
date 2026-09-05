import type { Engagement } from './types'

export const STORAGE_KEY = 'holdfast-squaremark-engagement-v1'

export const DEFAULT_ADMIN_PIN_HINT = 'change-me'

export function createSeedEngagement(): Engagement {
  return {
    client: 'SquareMark',
    lead: 'Dustin Perkins',
    ao: 'Tommy Hendler',
    assessorNote: 'Louis is the CSF assessor; content and scoring stay with him. This portal tracks progress and evidence collection only — no scores, no CUI.',
    scope: 'Remote Corporate IT (~2 staff). Systems in scope for evidence collection: Cloudflare, Microsoft 365, Github, Stripe, Zoho. No CUI in this application.',
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
        description: 'Kickoff materials, access requests, and engagement rhythm confirmed with AO.',
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
      postedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  }
}
