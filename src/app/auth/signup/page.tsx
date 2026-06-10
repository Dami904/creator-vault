"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { FormInput } from "@/components/shared/FormInput";
import { Alert } from "@/components/shared/Alert";
import { useApi } from "@/hooks/useApi";
import type { ProfileType } from "@/types";

export default function SignupPage() {
  const params = useSearchParams();
  const router = useRouter();
  const profileType = (params.get("type") ?? "creator") as ProfileType;
  const { post, loading, error } = useApi();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isOrg = profileType === "organization";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    const res = await post("/auth/register", {
      email: form.email,
      password: form.password,
      profile_type: profileType,
    });
    if (res) {
      router.push(isOrg ? "/onboarding/organization" : "/onboarding/creator");
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">
            {isOrg ? "Create a Brand Account" : "Create a Creator Account"}
          </h1>
          <p className="text-sm text-gray-400">
            {isOrg
              ? "Start posting deals and finding creators"
              : "Start applying for brand deals"}
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            required
          />
          <FormInput
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => setForm((f) => ({ ...f, password: v }))}
            required
          />
          <FormInput
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
