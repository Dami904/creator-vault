export type JobStatus = "draft" | "open" | "in_progress" | "completed" | "expired";
export type MilestoneStatus = "pending" | "submitted" | "approved" | "disputed";
export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type TransactionType = "deposit" | "withdrawal" | "escrow_lock" | "escrow_release";

export interface Job {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  target_platform: string;
  post_type: string;
  required_elements: string[];
  payout_type: "milestone" | "full";
  total_budget: number;
  deadline: string;
  eligibility: {
    min_reputation: number;
    required_platforms: string[];
    min_followers: number;
    region: string;
  };
  status: JobStatus;
  selected_creator_id: string | null;
  milestones?: Milestone[];
  created_at: string;
}

export interface Milestone {
  id: string;
  job_id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  status: MilestoneStatus;
  deliverable_url: string | null;
  ai_verdict: "pass" | "fail" | null;
  ai_reason: string | null;
  ai_confidence: number | null;
  created_at: string;
}

export interface MilestoneInput {
  title: string;
  description: string;
  amount: string;
  deadline: string;
}

export interface Application {
  id: string;
  job_id: string;
  creator_id: string;
  cover_note: string;
  status: ApplicationStatus;
  applied_at: string;
}

export interface Deal extends Job {
  milestones: Milestone[];
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  tx_hash: string | null;
  created_at: string;
}

export interface Dispute {
  id: string;
  milestone_id: string;
  raised_by: string;
  reason: string;
  status: "open" | "resolved";
  resolution: string | null;
  resolved_by: string | null;
  created_at: string;
}
