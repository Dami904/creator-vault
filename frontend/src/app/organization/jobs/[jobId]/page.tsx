"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { MilestoneCard } from "@/components/deals/MilestoneCard";
import { Badge } from "@/components/shared/Badge";
import { Alert } from "@/components/shared/Alert";
import { LoadingPage } from "@/components/shared/LoadingPage";
import type { Job, Milestone, Application } from "@/types/deals";

export default function OrgJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { get, data: job, loading } = useApi<Job>();
  const { get: getApps, data: applications } = useApi<Application[]>();
  const { get: getMilestones, data: milestones } = useApi<Milestone[]>();
  const { post, loading: acting, error } = useApi();

  useEffect(() => {
    get(`/jobs/${jobId}`);
    getApps(`/jobs/${jobId}/applications`);
    getMilestones(`/jobs/${jobId}/milestones`);
  }, [jobId]);

  async function selectCreator(creatorId: string) {
    await post(`/jobs/${jobId}/select/${creatorId}`, {});
    get(`/jobs/${jobId}`);
  }

  async function approveMilestone(milestoneId: string) {
    await post(`/milestones/${milestoneId}/approve`, {});
    getMilestones(`/jobs/${jobId}/milestones`);
  }

  async function disputeMilestone(milestoneId: string) {
    await post(`/milestones/${milestoneId}/dispute`, { reason: "Disputed by organization" });
    getMilestones(`/jobs/${jobId}/milestones`);
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 space-y-8 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{job?.title}</h1>
        {job && <Badge status={job.status} />}
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Applicants */}
      {job?.status === "open" && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Applicants</h2>
          {!applications?.length ? (
            <p className="text-gray-500 text-sm">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800"
                >
                  <div className="space-y-1">
                    <p className="font-medium">Creator #{app.creator_id}</p>
                    <p className="text-sm text-gray-400">{app.cover_note}</p>
                    <Badge status={app.status} />
                  </div>
                  {app.status === "pending" && (
                    <button
                      onClick={() => selectCreator(app.creator_id)}
                      disabled={acting}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      Select
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Milestones */}
      {milestones && milestones.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Milestones</h2>
          <div className="space-y-4">
            {milestones.map((m) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                role="organization"
                onApprove={() => approveMilestone(m.id)}
                onDispute={() => disputeMilestone(m.id)}
                submitting={acting}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
