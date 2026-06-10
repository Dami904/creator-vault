"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { Badge } from "@/components/shared/Badge";
import { LoadingPage } from "@/components/shared/LoadingPage";
import type { Job } from "@/types/deals";

interface OrgStats {
  active_jobs: number;
  pending_applicants: number;
  total_escrowed: number;
}

export default function OrgDashboardPage() {
  const { get, data: stats, loading } = useApi<OrgStats>();
  const { get: getJobs, data: jobs } = useApi<Job[]>();

  useEffect(() => {
    get("/organization/stats");
    getJobs("/jobs?role=organization");
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brand Dashboard</h1>
        <Link
          href="/organization/jobs/new"
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-sm font-semibold transition-colors"
        >
          + Post a Deal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Jobs", value: stats?.active_jobs ?? 0 },
          { label: "Pending Applicants", value: stats?.pending_applicants ?? 0 },
          { label: "Total Escrowed (USDC)", value: `$${stats?.total_escrowed ?? 0}` },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Jobs List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Posted Jobs</h2>
          <Link href="/organization/jobs" className="text-sm text-brand-500 hover:underline">
            View all →
          </Link>
        </div>

        {!jobs?.length ? (
          <p className="text-gray-500 text-sm">
            No jobs posted yet.{" "}
            <Link href="/organization/jobs/new" className="text-brand-500 hover:underline">
              Post your first deal
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => (
              <Link
                key={job.id}
                href={`/organization/jobs/${job.id}`}
                className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-gray-400">{job.target_platform} · ${job.total_budget} USDC</p>
                </div>
                <Badge status={job.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <nav className="flex flex-wrap gap-3">
        {[
          { href: "/organization/jobs/new", label: "Post Job" },
          { href: "/organization/profile", label: "My Profile" },
          { href: "/organization/wallet", label: "Wallet" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
