"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { FormTextarea } from "@/components/shared/FormTextarea";
import { Alert } from "@/components/shared/Alert";
import type { Job } from "@/types/deals";

interface ApplicationModalProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationModal({ job, onClose, onSuccess }: ApplicationModalProps) {
  const { post, loading, error } = useApi();
  const [coverNote, setCoverNote] = useState("");

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const res = await post(`/jobs/${job.id}/apply`, { cover_note: coverNote });
    if (res) onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md p-6 space-y-5 animate-fade-in">
        <div>
          <h2 className="text-lg font-bold">Apply for Deal</h2>
          <p className="text-sm text-gray-400 mt-1">{job.title}</p>
        </div>

        <div className="text-sm text-gray-400 space-y-1">
          <p>Budget: <span className="text-gray-200">${job.total_budget} USDC</span></p>
          <p>Platform: <span className="text-gray-200">{job.target_platform}</span></p>
          <p>Deadline: <span className="text-gray-200">{new Date(job.deadline).toLocaleDateString()}</span></p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleApply} className="space-y-4">
          <FormTextarea
            label="Cover Note"
            value={coverNote}
            onChange={setCoverNote}
            placeholder="Tell the brand why you're a great fit…"
            rows={4}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Applying…" : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
