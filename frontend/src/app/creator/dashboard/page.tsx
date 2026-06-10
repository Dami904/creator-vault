"use client";

import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { useEffect } from "react";
import { Badge } from "@/components/shared/Badge";
import { LoadingPage } from "@/components/shared/LoadingPage";
import type { Deal } from "@/types/deals";

interface DashboardStats {
  active_deals: number;
  pending_payouts: number;
  reputation_score: number;
}

export default function CreatorDashboardPage() {
  const { get, data: stats, loading } = useApi<DashboardStats>();
  const { get: getDeals, data: deals } = useApi<Deal[]>();

  useEffect(() => {
    get("/creator/stats");
    getDeals("/jobs?role=creator&status=in_progress");
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold">Creator Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Deals", value: stats?.active_deals ?? 0 },
          { label: "Pending Payouts (USDC)", value: stats?.pending_payouts ?? 0 },
          { label: "Reputation Score", value: stats?.reputation_score ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* My Deals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Deals</h2>
          <Link href="/creator/jobs" className="text-sm text-brand-500 hover:underline">
            Browse Jobs →
          </Link>
        </div>

        {!deals?.length ? (
          <p className="text-gray-500 text-sm">
            No active deals yet.{" "}
            <Link href="/creator/jobs" className="text-brand-500 hover:underline">
              Browse open jobs
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-2 pr-4">Brand</th>
                  <th className="text-left py-2 pr-4">Title</th>
                  <th className="text-left py-2 pr-4">Milestones</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Payout</th>
                  <th className="text-left py-2">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {deals?.map((deal) => (
                  <tr key={deal.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                    <td className="py-3 pr-4 font-medium">{deal.organization_id}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/creator/deals/${deal.id}`} className="hover:text-brand-400">
                        {deal.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{deal.milestones?.length ?? 0}</td>
                    <td className="py-3 pr-4">
                      <Badge status={deal.status} />
                    </td>
                    <td className="py-3 pr-4">${deal.total_budget} USDC</td>
                    <td className="py-3">{new Date(deal.deadline).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <nav className="flex flex-wrap gap-3">
        {[
          { href: "/creator/jobs", label: "Browse Jobs" },
          { href: "/creator/profile", label: "My Profile" },
          { href: "/creator/wallet", label: "Wallet" },
          { href: "/creator/reputation", label: "Reputation" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
