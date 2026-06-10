import type { Job } from "@/types/deals";
import { Badge } from "@/components/shared/Badge";

interface JobCardProps {
  job: Job;
  onApply: () => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex flex-col gap-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold leading-tight">{job.title}</p>
          <p className="text-xs text-gray-400">{job.target_platform} · {job.post_type}</p>
        </div>
        <Badge status={job.status} />
      </div>

      <p className="text-sm text-gray-400 line-clamp-2">{job.description}</p>

      <div className="flex gap-4 text-sm text-gray-400">
        <span className="text-gray-200 font-medium">${job.total_budget} USDC</span>
        <span>Due {new Date(job.deadline).toLocaleDateString()}</span>
      </div>

      {job.required_elements?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.required_elements.slice(0, 3).map((el) => (
            <span key={el} className="px-2 py-0.5 bg-gray-800 text-xs rounded-full text-gray-400 border border-gray-700">
              {el}
            </span>
          ))}
          {job.required_elements.length > 3 && (
            <span className="text-xs text-gray-500">+{job.required_elements.length - 3} more</span>
          )}
        </div>
      )}

      <button
        onClick={onApply}
        className="mt-auto w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-sm font-semibold transition-colors"
      >
        Apply Now
      </button>
    </div>
  );
}
