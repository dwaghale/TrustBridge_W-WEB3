"use client";

import { useState, useCallback } from "react";
import { Transaction } from "@/types";
import { getExplorerUrl } from "@/lib/utils";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTx = useCallback(
    (hash: string, method: string) => {
      const tx: Transaction = {
        hash,
        status: "pending",
        method,
        timestamp: Date.now(),
        explorerUrl: getExplorerUrl(hash),
      };
      setTransactions((prev) => [tx, ...prev].slice(0, 50));
    },
    []
  );

  const updateTxStatus = useCallback(
    (hash: string, status: "success" | "failed") => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.hash === hash ? { ...tx, status } : tx))
      );
    },
    []
  );

  return { transactions, addTx, updateTxStatus, setTransactions };
}
