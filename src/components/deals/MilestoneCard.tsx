import { Badge } from "@/components/shared/Badge";
import { FormInput } from "@/components/shared/FormInput";
import type { Milestone } from "@/types/deals";

interface MilestoneCardProps {
  milestone: Milestone;
  role: "creator" | "organization";
  deliverableUrl?: string;
  onDeliverableUrlChange?: (url: string) => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onDispute?: () => void;
  submitting?: boolean;
}

export function MilestoneCard({
  milestone: m,
  role,
  deliverableUrl,
  onDeliverableUrlChange,
  onSubmit,
  onApprove,
  onDispute,
  submitting,
}: MilestoneCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{m.title}</p>
          <p className="text-sm text-gray-400 mt-0.5">{m.description}</p>
        </div>
        <Badge status={m.status} />
      </div>

      <div className="flex gap-6 text-sm text-gray-400">
        <span>${m.amount} USDC</span>
        <span>Due {new Date(m.deadline).toLocaleDateString()}</span>
      </div>

      {/* AI Verdict */}
      {m.ai_verdict && (
        <div className={`rounded-lg p-3 text-sm border ${
          m.ai_verdict === "pass"
            ? "bg-green-900/20 border-green-700/40 text-green-300"
            : "bg-red-900/20 border-red-700/40 text-red-300"
        }`}>
          <p className="font-medium">AI Verdict: {m.ai_verdict.toUpperCase()}</p>
          <p className="text-xs mt-1 opacity-80">{m.ai_reason}</p>
          <p className="text-xs mt-0.5 opacity-60">Confidence: {Math.round((m.ai_confidence ?? 0) * 100)}%</p>
        </div>
      )}

      {/* Deliverable URL */}
      {m.deliverable_url && (
        <a
          href={m.deliverable_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-400 hover:underline break-all"
        >
          {m.deliverable_url}
        </a>
      )}

      {/* Creator Actions */}
      {role === "creator" && m.status === "pending" && (
        <div className="flex flex-col gap-3 pt-2">
          <FormInput
            label="Deliverable URL"
            value={deliverableUrl ?? ""}
            onChange={onDeliverableUrlChange ?? (() => {})}
            placeholder="https://instagram.com/p/…"
          />
          <div className="flex gap-3">
            <button
              onClick={onSubmit}
              disabled={submitting || !deliverableUrl}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Deliverable"}
            </button>
          </div>
        </div>
      )}

      {role === "creator" && m.status === "submitted" && (
        <button
          onClick={onDispute}
          disabled={submitting}
          className="text-sm text-orange-400 hover:underline disabled:opacity-50"
        >
          Raise Dispute
        </button>
      )}

      {/* Org Actions */}
      {role === "organization" && m.status === "submitted" && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={onApprove}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Approve & Release
          </button>
          <button
            onClick={onDispute}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-orange-900/40 border border-orange-700/40 text-orange-300 hover:bg-orange-900/60 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Dispute
          </button>
        </div>
      )}
    </div>
  );
}
