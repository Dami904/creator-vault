"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { FormInput } from "@/components/shared/FormInput";
import { LoadingPage } from "@/components/shared/LoadingPage";
import { Alert } from "@/components/shared/Alert";

interface ReputationData {
  wallet_address: string;
  score: number;
  on_chain_score: number;
}

export default function CreatorReputationPage() {
  const { get, data: own, loading } = useApi<ReputationData>();
  const { get: lookup, data: lookupResult, loading: looking, error: lookupError } = useApi<ReputationData>();
  const [walletInput, setWalletInput] = useState("");

  useEffect(() => {
    get("/profile/reputation/me");
  }, []);

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    lookup(`/reputation/${walletInput}`);
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 space-y-8 animate-fade-in max-w-xl">
      <h1 className="text-2xl font-bold">Reputation</h1>

      {/* Own Score */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
        <p className="text-sm text-gray-400">Your Score</p>
        <p className="text-5xl font-bold text-brand-400">{own?.score ?? 0}</p>
        <div className="flex gap-6 text-sm text-gray-400">
          <span>On-chain: {own?.on_chain_score ?? 0}</span>
          <span className="truncate">{own?.wallet_address}</span>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <p>+10 per completed deal (no disputes)</p>
          <p>-15 per lost dispute</p>
          <p>-5 per missed deadline</p>
        </div>
      </div>

      {/* Lookup */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Lookup by Wallet Address</h2>
        <form onSubmit={handleLookup} className="flex gap-3">
          <FormInput
            label=""
            value={walletInput}
            onChange={setWalletInput}
            placeholder="0x…"
          />
          <button
            type="submit"
            disabled={looking}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {looking ? "…" : "Look Up"}
          </button>
        </form>

        {lookupError && <Alert type="error" message={lookupError} />}
        {lookupResult && (
          <div className="mt-4 bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-sm text-gray-400 truncate">{lookupResult.wallet_address}</p>
            <p className="text-3xl font-bold text-brand-400 mt-1">{lookupResult.score}</p>
            <p className="text-xs text-gray-500 mt-1">On-chain: {lookupResult.on_chain_score}</p>
          </div>
        )}
      </section>
    </div>
  );
}
