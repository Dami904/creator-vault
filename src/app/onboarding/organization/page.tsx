"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/shared/FormInput";
import { FormTextarea } from "@/components/shared/FormTextarea";
import { Alert } from "@/components/shared/Alert";
import { useApi } from "@/hooks/useApi";

export default function OrganizationOnboardingPage() {
  const router = useRouter();
  const { put, loading, error } = useApi();

  const [form, setForm] = useState({
    brand_name: "",
    description: "",
    website_url: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await put("/profile/me", form);
    if (res) router.push("/organization/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Set up your brand profile</h1>
          <p className="text-sm text-gray-400 mt-1">
            Creators will see this when browsing your deals.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Brand Name"
            value={form.brand_name}
            onChange={(v) => setForm((f) => ({ ...f, brand_name: v }))}
            required
          />
          <FormTextarea
            label="Description"
            value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="What does your brand do? What kind of content are you looking for?"
          />
          <FormInput
            label="Website URL"
            type="url"
            value={form.website_url}
            onChange={(v) => setForm((f) => ({ ...f, website_url: v }))}
            placeholder="https://yourbrand.com"
          />

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
