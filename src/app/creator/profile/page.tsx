"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { FormInput } from "@/components/shared/FormInput";
import { FormTextarea } from "@/components/shared/FormTextarea";
import { Alert } from "@/components/shared/Alert";
import { LoadingPage } from "@/components/shared/LoadingPage";
import type { CreatorProfile } from "@/types/users";

const NICHES = ["Fashion", "Tech", "Gaming", "Food", "Travel", "Fitness", "Beauty", "Music", "Lifestyle", "Education"];

export default function CreatorProfilePage() {
  const { get, data: profile, loading } = useApi<CreatorProfile>();
  const { put, loading: saving, error, data: saved } = useApi();

  const [form, setForm] = useState<Partial<CreatorProfile>>({});

  useEffect(() => {
    get("/profile/me");
  }, []);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  function toggleNiche(niche: string) {
    setForm((f) => ({
      ...f,
      niche_tags: f.niche_tags?.includes(niche)
        ? f.niche_tags.filter((n) => n !== niche)
        : [...(f.niche_tags ?? []), niche],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await put("/profile/me", form);
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 max-w-lg space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {error && <Alert type="error" message={error} />}
      {saved && <Alert type="success" message="Profile updated successfully." />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Display Name"
          value={form.name ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
        />
        <FormTextarea
          label="Bio"
          value={form.bio ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, bio: v }))}
        />

        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">Niches</p>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => toggleNiche(n)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  form.niche_tags?.includes(n)
                    ? "border-brand-500 bg-brand-600/20 text-brand-400"
                    : "border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(["instagram", "twitter", "youtube", "tiktok"] as const).map((platform) => (
            <FormInput
              key={platform}
              label={platform.charAt(0).toUpperCase() + platform.slice(1)}
              placeholder="@handle"
              value={(form as Record<string, string>)[platform] ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, [platform]: v }))}
            />
          ))}
        </div>

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
