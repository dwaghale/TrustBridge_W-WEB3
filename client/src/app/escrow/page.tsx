"use client";

import { useEscrowCount, useEscrows } from "@/hooks/useContract";
import { EscrowCard } from "@/components/EscrowCard";
import { CreateEscrowForm } from "@/components/CreateEscrowForm";
import { useWallet } from "@/hooks/useWallet";
import { WalletIcon } from "lucide-react";

export default function EscrowPage() {
  const { isConnected } = useWallet();
  const { data: count = 0 } = useEscrowCount();
  const ids = Array.from({ length: count }, (_, i) => i + 1);
  const { data: escrows, isLoading } = useEscrows(ids);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <WalletIcon className="h-12 w-12 text-zinc-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-zinc-500">Connect your Stellar wallet to view and manage escrows.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Escrows</h1>
        <p className="text-sm text-zinc-500">{count} total</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Escrows</h2>
          {count === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
              No escrows yet. Create one to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {ids.reverse().map((id) => (
                <EscrowCard
                  key={id}
                  id={id}
                  escrow={escrows?.[id]}
                  isLoading={isLoading && !escrows?.[id]}
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <CreateEscrowForm />
        </div>
      </div>
    </div>
  );
}
