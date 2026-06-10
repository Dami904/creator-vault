"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/shared/FormInput";
import { FormTextarea } from "@/components/shared/FormTextarea";
import { Alert } from "@/components/shared/Alert";
import { useApi } from "@/hooks/useApi";

const NICHES = ["Fashion", "Tech", "Gaming", "Food", "Travel", "Fitness", "Beauty", "Music", "Lifestyle", "Education"];

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const { put, loading, error } = useApi();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    instagram: "",
    twitter: "",
    youtube: "",
    tiktok: "",
    niche_tags: [] as string[],
  });

  function toggleNiche(niche: string) {
    setForm((f) => ({
      ...f,
      niche_tags: f.niche_tags.includes(niche)
        ? f.niche_tags.filter((n) => n !== niche)
        : [...f.niche_tags, niche],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await put("/profile/me", form);
    if (res) router.push("/creator/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Set up your creator profile</h1>
          <p className="text-sm text-gray-400 mt-1">
            Help brands discover you — you can edit this later.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Display Name"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            required
          />
          <FormTextarea
            label="Bio"
            value={form.bio}
            onChange={(v) => setForm((f) => ({ ...f, bio: v }))}
            placeholder="Tell brands what you do…"
          />

          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">
              Niches (select all that apply)
            </p>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleNiche(n)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    form.niche_tags.includes(n)
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
                placeholder={`@handle`}
                value={form[platform]}
                onChange={(v) => setForm((f) => ({ ...f, [platform]: v }))}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
