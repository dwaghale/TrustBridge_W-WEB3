"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/utils";
import {
  HandshakeIcon,
  WalletIcon,
  ActivityIcon,
  HistoryIcon,
  LogOutIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: WalletIcon },
  { href: "/escrow", label: "Escrows", icon: HandshakeIcon },
  { href: "/events", label: "Events", icon: ActivityIcon },
  { href: "/activity", label: "Activity", icon: HistoryIcon },
];

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
            <HandshakeIcon className="h-5 w-5" />
            <span>EscrowHub</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-zinc-600 dark:text-zinc-400">
                {truncateAddress(address)}
              </span>
              <Button variant="outline" size="sm" onClick={disconnect}>
                <LogOutIcon className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={connect} disabled={isConnecting}>
              <WalletIcon className="h-4 w-4 mr-1" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
