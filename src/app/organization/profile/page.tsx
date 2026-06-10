"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { FormInput } from "@/components/shared/FormInput";
import { FormTextarea } from "@/components/shared/FormTextarea";
import { Alert } from "@/components/shared/Alert";
import { LoadingPage } from "@/components/shared/LoadingPage";
import type { OrgProfile } from "@/types/users";

export default function OrgProfilePage() {
  const { get, data: profile, loading } = useApi<OrgProfile>();
  const { put, loading: saving, error, data: saved } = useApi();
  const [form, setForm] = useState<Partial<OrgProfile>>({});

  useEffect(() => { get("/profile/me"); }, []);
  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await put("/profile/me", form);
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 max-w-lg space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Brand Profile</h1>

      {error && <Alert type="error" message={error} />}
      {saved && <Alert type="success" message="Profile updated." />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Brand Name"
          value={form.brand_name ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, brand_name: v }))}
          required
        />
        <FormTextarea
          label="Description"
          value={form.description ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))}
        />
        <FormInput
          label="Website URL"
          type="url"
          value={form.website_url ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, website_url: v }))}
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
