"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { JobCard } from "@/components/jobs/JobCard";
import { ApplicationModal } from "@/components/deals/ApplicationModal";
import { FormSelect } from "@/components/shared/FormSelect";
import { LoadingPage } from "@/components/shared/LoadingPage";
import type { Job } from "@/types/deals";

const PLATFORMS = ["All", "Instagram", "TikTok", "YouTube", "Twitter"];
const POST_TYPES = ["All", "Reel", "Post", "Story", "Video", "Thread"];

export default function CreatorJobsPage() {
  const { get, data: jobs, loading } = useApi<Job[]>();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState({ platform: "All", post_type: "All" });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.platform !== "All") params.set("platform", filters.platform);
    if (filters.post_type !== "All") params.set("post_type", filters.post_type);
    get(`/jobs?${params}`);
  }, [filters]);

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Browse Jobs</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <FormSelect
          label="Platform"
          value={filters.platform}
          onChange={(v) => setFilters((f) => ({ ...f, platform: v }))}
          options={PLATFORMS}
        />
        <FormSelect
          label="Post Type"
          value={filters.post_type}
          onChange={(v) => setFilters((f) => ({ ...f, post_type: v }))}
          options={POST_TYPES}
        />
      </div>

      {/* Job Cards */}
      {!jobs?.length ? (
        <p className="text-gray-500 text-sm">No jobs found matching these filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onApply={() => setSelectedJob(job)} />
          ))}
        </div>
      )}

      {selectedJob && (
        <ApplicationModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSuccess={() => {
            setSelectedJob(null);
            get("/jobs");
          }}
        />
      )}
    </div>
  );
}
