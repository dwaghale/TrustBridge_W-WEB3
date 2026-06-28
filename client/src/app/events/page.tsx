"use client";

import { EventFeed } from "@/components/EventFeed";
import { useWallet } from "@/hooks/useWallet";
import { WalletIcon } from "lucide-react";

export default function EventsPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <WalletIcon className="h-12 w-12 text-zinc-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-zinc-500">Connect your wallet to see real-time escrow events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Event Feed</h1>
      <p className="text-zinc-500 text-sm">
        Real-time events from the escrow contract. Events are polled automatically.
      </p>
      <EventFeed />
    </div>
  );
}
