"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input } from "@/components/ui";
import { updateSettings } from "@/app/(portal)/actions";

export function SettingsForm({
  name,
  website,
  canEdit,
}: {
  name: string;
  website: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [websiteValue, setWebsiteValue] = useState(website ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <div className="hair-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">Company profile</h2>
          {canEdit && (
            <Button variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-dim">Name</dt>
            <dd className="mt-1">{name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-dim">Website</dt>
            <dd className="mt-1">{website ?? "—"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-faint">
          Plan is shown for reference only — no billing or plan-gating logic is wired up yet.
        </p>
      </div>
    );
  }

  async function save() {
    setSaving(true);
    setError(null);
    const res = await updateSettings({ name: nameValue, website: websiteValue });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="hair-card p-5">
      <h2 className="mb-4 text-lg font-extrabold tracking-tight">Company profile</h2>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name">
          <Input value={nameValue} onChange={(e) => setNameValue(e.target.value)} />
        </Field>
        <Field label="Website" hint="Optional">
          <Input value={websiteValue} onChange={(e) => setWebsiteValue(e.target.value)} placeholder="https://…" />
        </Field>
      </div>
      {error && <p className="mt-3 text-sm font-semibold text-[#f4502f]">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setEditing(false);
            setNameValue(name);
            setWebsiteValue(website ?? "");
            setError(null);
          }}
        >
          Cancel
        </Button>
        <Button onClick={save} disabled={saving || !nameValue.trim()}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
