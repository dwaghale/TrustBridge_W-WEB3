"use client";

import { useWallet } from "@/hooks/useWallet";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionHistory } from "@/components/TransactionHistory";
import { WalletIcon } from "lucide-react";
import { useEscrowCount, useEscrows } from "@/hooks/useContract";
import { truncateAddress, formatAmount } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ActivityIcon } from "lucide-react";

export default function ActivityPage() {
  const { address, isConnected } = useWallet();
  const { transactions } = useTransactions();
  const { data: count = 0 } = useEscrowCount();
  const ids = Array.from({ length: count }, (_, i) => i + 1);
  const { data: escrows } = useEscrows(ids);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <WalletIcon className="h-12 w-12 text-zinc-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-zinc-500">Connect your wallet to view your activity.</p>
      </div>
    );
  }

  // Filter escrows involving this wallet
  const myEscrows = escrows
    ? Object.entries(escrows).filter(
        ([_, e]) =>
          e.buyer === address ||
          e.seller === address ||
          e.arbitrator === address
      )
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activity</h1>
      <p className="text-zinc-500 text-sm">Your escrow activity and transaction history.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5" />
              My Escrows
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myEscrows.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <ActivityIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No escrows involving your wallet yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myEscrows.map(([id, e]) => (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/50"
                  >
                    <div>
                      <span className="font-medium">Escrow #{id}</span>
                      <span className="text-zinc-500 ml-2">
                        {formatAmount(e.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      {e.buyer === address && <span className="text-blue-500">Buyer</span>}
                      {e.seller === address && <span className="text-green-500">Seller</span>}
                      {e.arbitrator === address && <span className="text-yellow-500">Arbitrator</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
}
