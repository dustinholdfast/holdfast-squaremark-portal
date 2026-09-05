# SquareMark Holdfast Week 1 progress portal

View-only client progress for Tommy Hendler (AO). Dustin Perkins updates statuses after unlocking admin.

This is progress and evidence collection only. Louis is the CSF assessor; scoring and assessment content stay with him. No scores, no CUI, no file uploads.

Host: Cloudflare Pages only. Do not deploy to Vercel.


## Local setup
npm install
npm run dev


Vite does not serve /api/state. The UI falls back to localStorage and shows a local-demo banner until D1 or KV is bound.

Default admin PIN hint: change-me. Optional client hint: VITE_ADMIN_PIN. Real write gate is server ADMIN_PIN.

Optional local Pages Functions after build: wrangler pages dev dist

# Deploy

Cloudflare Pages only. Do not use Vercel.

Connect the GitHub repo or run wrangler pages deploy after build.
Create D1, bind ENGAGEMENT_DB, set ADMIN_PIN.
Protect the Pages URL with Cloudflare Access for Tommy and Dustin.

## D1 preferred shared state

npx wrangler d1 create squaremark-portal

Bind ENGAGEMENT_DB in Pages settings, or put database_id in wrangler.toml (replace REPLACE_WITH_D1_ID).

Optional schema: npx wrangler d1 execute squaremark-portal --remote --file=schema.sql

KV fallback: create a namespace and bind ENGAGEMENT_STATE.


## Admin PIN and Cloudflare Access

Set ADMIN_PIN on the Pages project (environment or secret). Optional ADMIN_EMAILS for Access-authenticated writers (Dustin only). Tommy stays view-only.

Zero Trust, Access, Applications, Self-hosted. Protect the Pages URL. Allow Tommy and Dustin emails.

Until Access is on, treat the URL as sensitive. ADMIN_PIN is still required for edits.



## What it tracks

D1-D6 milestones, evidence checklist, interviews, derived needs, progress percent (not a score).

Stack: Vite + React + TypeScript + Tailwind v4 + Cloudflare Pages Functions + D1 or KV.

## Pages build settings

Repo: https://github.com/dustinholdfast/holdfast-squaremark-portal
Build command: npm run build
Output directory: dist
