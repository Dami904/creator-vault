type Status =
  | "draft"
  | "open"
  | "in_progress"
  | "completed"
  | "expired"
  | "pending"
  | "submitted"
  | "approved"
  | "disputed"
  | "accepted"
  | "rejected"
  | "resolved";

interface BadgeProps {
  status: Status | string;
}

const COLORS: Record<string, string> = {
  draft: "bg-gray-700 text-gray-300",
  open: "bg-blue-900/40 text-blue-300 border border-blue-700/50",
  in_progress: "bg-yellow-900/40 text-yellow-300 border border-yellow-700/50",
  completed: "bg-green-900/40 text-green-300 border border-green-700/50",
  expired: "bg-red-900/40 text-red-300 border border-red-700/50",
  pending: "bg-gray-700 text-gray-300",
  submitted: "bg-blue-900/40 text-blue-300 border border-blue-700/50",
  approved: "bg-green-900/40 text-green-300 border border-green-700/50",
  disputed: "bg-orange-900/40 text-orange-300 border border-orange-700/50",
  accepted: "bg-green-900/40 text-green-300 border border-green-700/50",
  rejected: "bg-red-900/40 text-red-300 border border-red-700/50",
  resolved: "bg-gray-600 text-gray-200",
};

export function Badge({ status }: BadgeProps) {
  const cls = COLORS[status] ?? "bg-gray-700 text-gray-300";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
