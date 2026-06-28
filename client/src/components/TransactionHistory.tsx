"use client";

import { useTransactions } from "@/hooks/useTransactions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HistoryIcon, ExternalLinkIcon } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { STELLAR_EXPERT_URL } from "@/lib/constants";

const TX_STATUS_VARIANTS: Record<string, "success" | "destructive" | "warning"> = {
  success: "success",
  failed: "destructive",
  pending: "warning",
};

// This component reads from a global store or receives transactions as props
// For now, we use a simple approach - the parent passes transactions
interface TransactionHistoryProps {
  transactions?: Array<{
    hash: string;
    status: "pending" | "success" | "failed";
    method: string;
    timestamp: number;
    explorerUrl: string;
  }>;
}

export function TransactionHistory({ transactions = [] }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-zinc-500">
            <HistoryIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No transactions yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HistoryIcon className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="flex items-center gap-2">
                <Badge variant={TX_STATUS_VARIANTS[tx.status] || "default"}>
                  {tx.status}
                </Badge>
                <span className="text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                  {truncateAddress(tx.hash, 8)}
                </span>
                <span className="text-zinc-400 text-xs">{tx.method}</span>
              </div>
              <a
                href={tx.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-600"
              >
                <ExternalLinkIcon className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
