-- Mindfries — Roles as a real entity (PRD §1.4 Role Management), additive
-- to 0002_product.sql. A company can be hiring for several roles at once;
-- previously "role" on an assessment was only a free-text string. This adds
-- a real roles table and a nullable FK from assessments — it does not
-- rename or drop assessments.role, which candidate/frontend and
-- internal-admin still read as a plain display string. Apply after
-- 0002_product.sql in the officemindfries Supabase project.

create table if not exists roles (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies(id) on delete cascade,
  title        text not null,
  status       text not null default 'open',          -- open|closed
  requirements text,
  tech_stack   text[] not null default '{}',
  created_at   timestamptz not null default now()
);
create index if not exists roles_company_idx on roles (company_id);

alter table assessments add column if not exists role_id uuid references roles(id) on delete set null;
