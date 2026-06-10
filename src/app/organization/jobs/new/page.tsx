"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/shared/FormInput";
import { FormTextarea } from "@/components/shared/FormTextarea";
import { FormSelect } from "@/components/shared/FormSelect";
import { Alert } from "@/components/shared/Alert";
import { useApi } from "@/hooks/useApi";
import type { MilestoneInput } from "@/types/deals";

const STEPS = ["Deal Info", "Payout", "Deadline", "Eligibility", "Review"];
const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter"];
const POST_TYPES = ["Reel", "Post", "Story", "Video", "Thread"];

interface JobForm {
  title: string;
  description: string;
  target_platform: string;
  post_type: string;
  required_elements: string[];
  payout_type: "milestone" | "full";
  milestones: MilestoneInput[];
  total_budget: string;
  deadline: string;
  eligibility: {
    min_reputation: number;
    required_platforms: string[];
    min_followers: number;
    region: string;
  };
}

const DEFAULT_FORM: JobForm = {
  title: "",
  description: "",
  target_platform: "Instagram",
  post_type: "Reel",
  required_elements: [],
  payout_type: "milestone",
  milestones: [],
  total_budget: "",
  deadline: "",
  eligibility: { min_reputation: 0, required_platforms: [], min_followers: 0, region: "" },
};

export default function NewJobPage() {
  const router = useRouter();
  const { post, loading, error } = useApi();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<JobForm>(DEFAULT_FORM);
  const [elementInput, setElementInput] = useState("");

  function addElement() {
    if (!elementInput.trim()) return;
    setForm((f) => ({ ...f, required_elements: [...f.required_elements, elementInput.trim()] }));
    setElementInput("");
  }

  function addMilestone() {
    setForm((f) => ({
      ...f,
      milestones: [...f.milestones, { title: "", description: "", amount: "", deadline: "" }],
    }));
  }

  function updateMilestone(i: number, key: keyof MilestoneInput, value: string) {
    setForm((f) => {
      const milestones = [...f.milestones];
      milestones[i] = { ...milestones[i], [key]: value };
      return { ...f, milestones };
    });
  }

  async function handleSubmit() {
    const payload = {
      ...form,
      total_budget: parseFloat(form.total_budget),
      milestones: form.milestones.map((m) => ({ ...m, amount: parseFloat(m.amount) })),
    };
    const res = await post("/jobs", payload);
    if (res) router.push("/organization/dashboard");
  }

  return (
    <div className="p-6 max-w-2xl space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold">Post a Deal</h1>

      {/* Step Indicator */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              i <= step ? "bg-brand-500" : "bg-gray-700"
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-400">
        Step {step + 1} of {STEPS.length}: <span className="text-gray-200">{STEPS[step]}</span>
      </p>

      {error && <Alert type="error" message={error} />}

      {/* Step 1: Deal Info */}
      {step === 0 && (
        <div className="space-y-4">
          <FormInput label="Title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} required />
          <FormTextarea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
          <FormSelect label="Platform" value={form.target_platform} onChange={(v) => setForm((f) => ({ ...f, target_platform: v }))} options={PLATFORMS} />
          <FormSelect label="Post Type" value={form.post_type} onChange={(v) => setForm((f) => ({ ...f, post_type: v }))} options={POST_TYPES} />
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Required Elements</p>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                value={elementInput}
                onChange={(e) => setElementInput(e.target.value)}
                placeholder="e.g. mention brand, include link in bio"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addElement())}
              />
              <button type="button" onClick={addElement} className="px-3 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.required_elements.map((el) => (
                <span key={el} className="px-2 py-1 bg-gray-800 text-xs rounded-full border border-gray-700">{el}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Payout */}
      {step === 1 && (
        <div className="space-y-4">
          <FormSelect
            label="Payout Type"
            value={form.payout_type}
            onChange={(v) => setForm((f) => ({ ...f, payout_type: v as "milestone" | "full" }))}
            options={["milestone", "full"]}
          />
          <FormInput
            label="Total Budget (USDC)"
            type="number"
            value={form.total_budget}
            onChange={(v) => setForm((f) => ({ ...f, total_budget: v }))}
            required
          />
          {form.payout_type === "milestone" && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-300">Milestones</p>
              {form.milestones.map((m, i) => (
                <div key={i} className="p-4 bg-gray-800 rounded-xl space-y-3 border border-gray-700">
                  <FormInput label="Title" value={m.title} onChange={(v) => updateMilestone(i, "title", v)} />
                  <FormInput label="Description" value={m.description} onChange={(v) => updateMilestone(i, "description", v)} />
                  <FormInput label="Amount (USDC)" type="number" value={m.amount} onChange={(v) => updateMilestone(i, "amount", v)} />
                </div>
              ))}
              <button type="button" onClick={addMilestone} className="text-sm text-brand-500 hover:underline">
                + Add Milestone
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Deadline */}
      {step === 2 && (
        <div className="space-y-4">
          <FormInput
            label="Overall Deadline"
            type="date"
            value={form.deadline}
            onChange={(v) => setForm((f) => ({ ...f, deadline: v }))}
            required
          />
          {form.payout_type === "milestone" && form.milestones.map((m, i) => (
            <FormInput
              key={i}
              label={`Milestone ${i + 1} Deadline: ${m.title}`}
              type="date"
              value={m.deadline}
              onChange={(v) => updateMilestone(i, "deadline", v)}
            />
          ))}
        </div>
      )}

      {/* Step 4: Eligibility */}
      {step === 3 && (
        <div className="space-y-4">
          <FormInput
            label="Min Reputation Score"
            type="number"
            value={String(form.eligibility.min_reputation)}
            onChange={(v) => setForm((f) => ({ ...f, eligibility: { ...f.eligibility, min_reputation: parseInt(v) } }))}
          />
          <FormInput
            label="Min Followers"
            type="number"
            value={String(form.eligibility.min_followers)}
            onChange={(v) => setForm((f) => ({ ...f, eligibility: { ...f.eligibility, min_followers: parseInt(v) } }))}
          />
          <FormInput
            label="Region (leave blank for global)"
            value={form.eligibility.region}
            onChange={(v) => setForm((f) => ({ ...f, eligibility: { ...f.eligibility, region: v } }))}
          />
        </div>
      )}

      {/* Step 5: Review */}
      {step === 4 && (
        <div className="space-y-4 text-sm">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-2">
            <p><span className="text-gray-400">Title:</span> {form.title}</p>
            <p><span className="text-gray-400">Platform:</span> {form.target_platform} · {form.post_type}</p>
            <p><span className="text-gray-400">Budget:</span> ${form.total_budget} USDC ({form.payout_type})</p>
            <p><span className="text-gray-400">Milestones:</span> {form.milestones.length}</p>
            <p><span className="text-gray-400">Deadline:</span> {form.deadline}</p>
          </div>
          <p className="text-xs text-gray-500">
            Posting this deal will lock the full budget in escrow on Morph L2.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm transition-colors">
            Back
          </button>
        ) : <div />}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-sm font-semibold transition-colors">
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-sm font-semibold transition-colors disabled:opacity-50">
            {loading ? "Creating…" : "Create Deal & Lock Escrow"}
          </button>
        )}
      </div>
    </div>
  );
}
