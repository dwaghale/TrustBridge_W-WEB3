"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nativeToScVal } from "@stellar/stellar-sdk";
import {
  readEscrow,
  readEscrowCount,
  buildContractCall,
  submitTx,
} from "@/lib/soroban";
import { useWallet } from "./useWallet";
import { Escrow } from "@/types";
import { toast } from "sonner";
import { POLL_INTERVAL_MS } from "@/lib/constants";

export function useEscrowCount() {
  return useQuery({
    queryKey: ["escrowCount"],
    queryFn: readEscrowCount,
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useEscrow(id: number | null) {
  return useQuery({
    queryKey: ["escrow", id],
    queryFn: () => readEscrow(id!),
    enabled: id !== null && id > 0,
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useEscrows(ids: number[]) {
  return useQuery({
    queryKey: ["escrows", ids],
    queryFn: async () => {
      const results: Record<number, Escrow> = {};
      for (const id of ids) {
        try {
          results[id] = await readEscrow(id);
        } catch {
          // skip invalid ids
        }
      }
      return results;
    },
    enabled: ids.length > 0,
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useCreateEscrow() {
  const { signTransaction, address, isConnected } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      seller,
      arbitrator,
      token,
      amount,
    }: {
      seller: string;
      arbitrator: string;
      token: string;
      amount: bigint;
    }) => {
      if (!isConnected || !address) throw new Error("Wallet not connected");
      const tx = await buildContractCall(
        "create",
        [
          nativeToScVal(address, { type: "address" }),
          nativeToScVal(seller, { type: "address" }),
          nativeToScVal(arbitrator, { type: "address" }),
          nativeToScVal(token, { type: "address" }),
          nativeToScVal(amount, { type: "i128" }),
        ],
        address
      );
      const signedXdr = await signTransaction(tx.toXDR());
      return submitTx(signedXdr);
    },
    onSuccess: (data) => {
      toast.success("Escrow created successfully!");
      queryClient.invalidateQueries({ queryKey: ["escrowCount"] });
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (err: Error) => {
      if (err.message.includes("rejected")) {
        toast.error("Transaction rejected by user");
      } else if (err.message.includes("insufficient")) {
        toast.error("Insufficient balance");
      } else {
        toast.error(err.message || "Failed to create escrow");
      }
    },
  });
}

export function useApproveEscrow() {
  const { signTransaction, address, isConnected } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      if (!isConnected || !address) throw new Error("Wallet not connected");
      const tx = await buildContractCall(
        "approve",
        [
          nativeToScVal(id, { type: "u64" }),
          nativeToScVal(address, { type: "address" }),
        ],
        address
      );
      const signedXdr = await signTransaction(tx.toXDR());
      return submitTx(signedXdr);
    },
    onSuccess: (_, { id }) => {
      toast.success("Approved!");
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
      queryClient.invalidateQueries({ queryKey: ["escrowCount"] });
    },
    onError: (err: Error) => {
      if (err.message.includes("rejected")) {
        toast.error("Transaction rejected");
      } else {
        toast.error(err.message || "Failed to approve");
      }
    },
  });
}

export function useFlagDispute() {
  const { signTransaction, address, isConnected } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      if (!isConnected || !address) throw new Error("Wallet not connected");
      const tx = await buildContractCall(
        "flag_dispute",
        [
          nativeToScVal(id, { type: "u64" }),
          nativeToScVal(address, { type: "address" }),
        ],
        address
      );
      const signedXdr = await signTransaction(tx.toXDR());
      return submitTx(signedXdr);
    },
    onSuccess: (_, { id }) => {
      toast.success("Dispute flagged!");
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
      queryClient.invalidateQueries({ queryKey: ["escrowCount"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to flag dispute");
    },
  });
}

export function useResolveDispute() {
  const { signTransaction, address, isConnected } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      buyerAmount,
      sellerAmount,
    }: {
      id: number;
      buyerAmount: bigint;
      sellerAmount: bigint;
    }) => {
      if (!isConnected || !address) throw new Error("Wallet not connected");
      const tx = await buildContractCall(
        "resolve",
        [
          nativeToScVal(id, { type: "u64" }),
          nativeToScVal(address, { type: "address" }),
          nativeToScVal(buyerAmount, { type: "i128" }),
          nativeToScVal(sellerAmount, { type: "i128" }),
        ],
        address
      );
      const signedXdr = await signTransaction(tx.toXDR());
      return submitTx(signedXdr);
    },
    onSuccess: (_, { id }) => {
      toast.success("Dispute resolved!");
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to resolve dispute");
    },
  });
}

export function useRefundEscrow() {
  const { signTransaction, address, isConnected } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      if (!isConnected || !address) throw new Error("Wallet not connected");
      const tx = await buildContractCall(
        "refund",
        [
          nativeToScVal(id, { type: "u64" }),
          nativeToScVal(address, { type: "address" }),
        ],
        address
      );
      const signedXdr = await signTransaction(tx.toXDR());
      return submitTx(signedXdr);
    },
    onSuccess: (_, { id }) => {
      toast.success("Escrow refunded!");
      queryClient.invalidateQueries({ queryKey: ["escrow", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to refund");
    },
  });
}
