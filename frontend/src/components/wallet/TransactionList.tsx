import type { Transaction } from "@/types/deals";
import { Badge } from "@/components/shared/Badge";

interface TransactionListProps {
  transactions: Transaction[];
}

const TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  escrow_lock: "Escrow Lock",
  escrow_release: "Escrow Release",
};

export function TransactionList({ transactions }: TransactionListProps) {
  if (!transactions.length) {
    return <p className="text-gray-500 text-sm">No transactions yet.</p>;
  }

  return (
    <div className="divide-y divide-gray-800">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{TYPE_LABELS[tx.type] ?? tx.type}</p>
            <p className="text-xs text-gray-500">
              {new Date(tx.created_at).toLocaleString()}
            </p>
            {tx.tx_hash && (
              <p className="text-xs text-brand-500 font-mono truncate max-w-[200px]">{tx.tx_hash}</p>
            )}
          </div>
          <div className="text-right space-y-1">
            <p className={`text-sm font-semibold ${
              tx.type === "deposit" || tx.type === "escrow_release"
                ? "text-green-400"
                : "text-red-400"
            }`}>
              {tx.type === "deposit" || tx.type === "escrow_release" ? "+" : "-"}${tx.amount}
            </p>
            <Badge status={tx.type} />
          </div>
        </div>
      ))}
    </div>
  );
}
