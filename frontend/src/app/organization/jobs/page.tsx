"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { Badge } from "@/components/shared/Badge";
import { FormSelect } from "@/components/shared/FormSelect";
import { LoadingPage } from "@/components/shared/LoadingPage";
import type { Job, JobStatus } from "@/types/deals";

const STATUS_OPTIONS: JobStatus[] = ["draft", "open", "in_progress", "completed", "expired"];

export default function OrgJobsPage() {
  const { get, data: jobs, loading } = useApi<Job[]>();
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const params = statusFilter !== "All" ? `?status=${statusFilter}` : "";
    get(`/jobs${params}`);
  }, [statusFilter]);

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posted Jobs</h1>
        <Link
          href="/organization/jobs/new"
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-sm font-semibold transition-colors"
        >
          + Post New Deal
        </Link>
      </div>

      <FormSelect
        label="Status"
        value={statusFilter}
        onChange={setStatusFilter}
        options={["All", ...STATUS_OPTIONS]}
      />

      {!jobs?.length ? (
        <p className="text-gray-500 text-sm">No jobs found.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/organization/jobs/${job.id}`}
              className="flex items-center justify-between p-5 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="space-y-1">
                <p className="font-semibold">{job.title}</p>
                <p className="text-sm text-gray-400">
                  {job.target_platform} · {job.post_type} · ${job.total_budget} USDC
                </p>
                <p className="text-xs text-gray-500">
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </p>
              </div>
              <Badge status={job.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
