"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { MilestoneCard } from "@/components/deals/MilestoneCard";
import { LoadingPage } from "@/components/shared/LoadingPage";
import { Alert } from "@/components/shared/Alert";
import { Badge } from "@/components/shared/Badge";
import type { Deal, Milestone } from "@/types/deals";

export default function CreatorDealDetailPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const { get, data: deal, loading } = useApi<Deal>();
  const { get: getMilestones, data: milestones } = useApi<Milestone[]>();
  const { post, loading: submitting, error: submitError } = useApi();

  const [submitUrl, setSubmitUrl] = useState<Record<string, string>>({});

  useEffect(() => {
    get(`/jobs/${dealId}`);
    getMilestones(`/jobs/${dealId}/milestones`);
  }, [dealId]);

  async function handleSubmit(milestoneId: string) {
    await post(`/milestones/${milestoneId}/submit`, {
      deliverable_url: submitUrl[milestoneId],
    });
    getMilestones(`/jobs/${dealId}/milestones`);
  }

  async function handleDispute(milestoneId: string) {
    await post(`/milestones/${milestoneId}/dispute`, { reason: "Disputed by creator" });
    getMilestones(`/jobs/${dealId}/milestones`);
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 space-y-8 animate-fade-in max-w-3xl">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{deal?.title}</h1>
          {deal && <Badge status={deal.status} />}
        </div>
        <p className="text-gray-400 text-sm">{deal?.description}</p>
      </div>

      {submitError && <Alert type="error" message={submitError} />}

      <section>
        <h2 className="text-lg font-semibold mb-4">Milestones</h2>
        <div className="space-y-4">
          {milestones?.map((m) => (
            <MilestoneCard
              key={m.id}
              milestone={m}
              role="creator"
              deliverableUrl={submitUrl[m.id] ?? ""}
              onDeliverableUrlChange={(url) =>
                setSubmitUrl((prev) => ({ ...prev, [m.id]: url }))
              }
              onSubmit={() => handleSubmit(m.id)}
              onDispute={() => handleDispute(m.id)}
              submitting={submitting}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
