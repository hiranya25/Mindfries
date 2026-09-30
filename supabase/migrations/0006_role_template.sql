-- Mindfries — R4 Assessment Configuration (PRD §1.4 Role Management flow:
-- Create Role -> Role Requirements -> Tech Stack -> Assessment Configuration
-- -> Invite Candidates). Additive to 0005_roles.sql.
--
-- A role can name a preferred/default published template from the shared
-- Game Library — still just a default the invite form pre-selects, never a
-- constraint: any published template can still be picked at invite time.
-- This is NOT a new authoring surface (no repo/task/rubric config here) —
-- that stays in internal-admin, per ARCHITECTURE.md.

alter table roles add column if not exists template_id uuid references game_templates(id) on delete set null;
