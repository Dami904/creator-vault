"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { TransactionList } from "@/components/wallet/TransactionList";
import { FormInput } from "@/components/shared/FormInput";
import { Alert } from "@/components/shared/Alert";
import { LoadingPage } from "@/components/shared/LoadingPage";
import type { Transaction } from "@/types/deals";

export default function CreatorWalletPage() {
  const { get, data: balance, loading } = useApi<{ balance: string }>();
  const { get: getTxs, data: transactions } = useApi<Transaction[]>();
  const { post, loading: processing, error } = useApi();
  const [txHash, setTxHash] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    get("/wallet/balance");
    getTxs("/wallet/transactions");
  }, []);

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    const res = await post("/wallet/deposit", { tx_hash: txHash, amount: parseFloat(amount) });
    if (res) {
      setTxHash("");
      setAmount("");
      get("/wallet/balance");
      getTxs("/wallet/transactions");
    }
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 space-y-8 animate-fade-in max-w-xl">
      <h1 className="text-2xl font-bold">Wallet</h1>

      {/* Balance */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <p className="text-sm text-gray-400">USDC Balance</p>
        <p className="text-4xl font-bold mt-1">${balance?.balance ?? "0.00"}</p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Deposit */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Record Deposit</h2>
        <form onSubmit={handleDeposit} className="space-y-3">
          <FormInput
            label="Transaction Hash"
            value={txHash}
            onChange={setTxHash}
            placeholder="0x…"
            required
          />
          <FormInput
            label="Amount (USDC)"
            type="number"
            value={amount}
            onChange={setAmount}
            placeholder="100"
            required
          />
          <button
            type="submit"
            disabled={processing}
            className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold transition-colors disabled:opacity-50"
          >
            {processing ? "Processing…" : "Record Deposit"}
          </button>
        </form>
      </section>

      {/* Transactions */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Transaction History</h2>
        <TransactionList transactions={transactions ?? []} />
      </section>
    </div>
  );
}
