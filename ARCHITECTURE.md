# Architecture

## Apps
- **candidate/** — what candidates use. `frontend/` (Next.js) + `backend/` (FastAPI).
- **internal-admin/** — Mindfries-team ops portal. `frontend/` (Next.js) + `backend/` (FastAPI, to come).
- **company/** — an earlier, partial scaffold of the company-facing Admin Portal.
  Superseded by **company-dashboard/** (below); left as-is, not merged or deleted.
- **company-dashboard/** — the company-facing Admin Portal (PRD §1.4): invite
  candidates, pick a published assessment, review status, manage the team, edit
  settings. `frontend/` (Next.js) only — no separate backend, same `lib/db.ts`-over-
  Supabase pattern as the other two. Real per-teammate Supabase Auth accounts
  (not a shared login) and Resend-based invite emails, both provisioned the same
  way `internal-admin`'s `onboardCompany` provisions the founding admin account.

## Data & interaction (decision)
**Supabase (Postgres) is the single system of record and the interaction layer.**
All three apps read/write shared tables **server-side only** (service-role key, never
in the browser). This is how the apps talk — no direct app-to-app calls for CRUD.

`company-dashboard/frontend` (and the `company/frontend` scaffold it superseded) is
also the first app doing real end-user auth (Supabase Auth, email+password) rather
than a stubbed login — see its own `lib/session.ts` and `proxy.ts`. `internal-admin`'s
`onboardCompany` action provisions both the `companies`
row and the Supabase Auth user together (`lib/db.ts`'s `createCompanyAccount`); a
company's `company_id`/`role` live in the auth user's `app_metadata` (server-settable
only), not `user_metadata`, so a signed-in company admin can't repoint their own
`company_id` via the client SDK.

- `supabase/migrations/0001_tracker.sql` — internal-admin lead/growth pipeline.
- `supabase/migrations/0002_product.sql` — shared product schema: `companies`,
  `game_templates`, `assessments`, `sessions`.

**FastAPI is for compute, not CRUD.** It earns its place only where Supabase
can't: sandbox orchestration, the evaluation pipeline, and the Gemini Live
interviewer. Until those exist, CRUD and reads go straight to Supabase from each
Next app's server layer (`lib/db.ts`).

### The loop
```
admin authors template (game_templates, published)
   └─► company portal reads published templates, invites a candidate (assessments row)
          └─► candidate dashboard reads their assessments
                 └─► candidate starts one → writes a sessions row (status=live)
                        └─► admin Session Monitor reads sessions live; reset / re-trigger eval
                        └─► company portal reads sessions/assessments for that candidate's status
```

## Why not a FastAPI monolith for everything now
Supabase already provides auth, row-level security, realtime, and a Postgres API.
Duplicating that in a Python service to move CRUD between two Next apps adds a
deploy target and a network hop for no benefit (YAGNI). The `lib/db.ts` seam in
each app keeps the door open to move specific reads/writes behind FastAPI later
without touching the UI.
