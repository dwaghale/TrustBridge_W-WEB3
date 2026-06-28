"use client";

import { useWallet } from "@/hooks/useWallet";
import { useEscrowCount, useEscrows } from "@/hooks/useContract";
import { CreateEscrowForm } from "@/components/CreateEscrowForm";
import { EscrowCard } from "@/components/EscrowCard";
import { EventFeed } from "@/components/EventFeed";
import { TransactionHistory } from "@/components/TransactionHistory";
import { useTransactions } from "@/hooks/useTransactions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  HandshakeIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  RotateCcwIcon,
  WalletIcon,
} from "lucide-react";
import { truncateAddress } from "@/lib/utils";

export default function Home() {
  const { address, isConnected, error, connect, isConnecting } = useWallet();
  const { data: count = 0 } = useEscrowCount();

  // Load all escrow IDs
  const ids = Array.from({ length: count }, (_, i) => i + 1);
  const { data: escrows } = useEscrows(ids);
  const { transactions } = useTransactions();

  const statusCounts = {
    pending: 0,
    disputed: 0,
    released: 0,
    refunded: 0,
  };
  if (escrows) {
    Object.values(escrows).forEach((e) => {
      if (e.status === 0) statusCounts.pending++;
      else if (e.status === 1) statusCounts.disputed++;
      else if (e.status === 2) statusCounts.released++;
      else if (e.status === 3) statusCounts.refunded++;
    });
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Wallet Connection State */}
      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <WalletIcon className="h-12 w-12 text-zinc-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Welcome to EscrowHub</h2>
            <p className="text-zinc-500 mb-6 max-w-md">
              Connect your Stellar wallet to create escrows, manage disputes, and track transactions on the Stellar network.
            </p>
            <button
              onClick={connect}
              disabled={isConnecting}
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <HandshakeIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-zinc-500">Total Escrows</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.released}</p>
                  <p className="text-xs text-zinc-500">Released</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <AlertTriangleIcon className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.disputed}</p>
                  <p className="text-xs text-zinc-500">Disputed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <RotateCcwIcon className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.refunded}</p>
                  <p className="text-xs text-zinc-500">Refunded</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Create Escrow */}
            <CreateEscrowForm />

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Connected Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="text-zinc-500">Address:</span>{" "}
                  <span className="font-mono">{truncateAddress(address, 12)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-zinc-500">Network:</span>{" "}
                  <span className="font-medium">Testnet</span>
                </div>
                <p className="text-xs text-zinc-400 mt-4">
                  Your wallet is connected. You can create new escrows,
                  approve releases, flag disputes, and refund escrows.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Escrows */}
          {count > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Recent Escrows</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ids.slice(-6).reverse().map((id) => (
                  <EscrowCard
                    key={id}
                    id={id}
                    escrow={escrows?.[id]}
                    isLoading={!escrows?.[id]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Activity Feed Side by Side */}
          <div className="grid gap-6 lg:grid-cols-2">
            <EventFeed />
            <TransactionHistory transactions={transactions} />
          </div>
        </>
      )}
    </div>
  );
}
