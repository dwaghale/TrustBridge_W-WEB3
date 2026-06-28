export interface Escrow {
  buyer: string;
  seller: string;
  arbitrator: string;
  token: string;
  amount: string;
  status: number;
  buyer_approved: boolean;
  seller_approved: boolean;
}

export type EscrowStatus = "Pending" | "Disputed" | "Released" | "Refunded";

export const ESCROW_STATUS_MAP: Record<number, EscrowStatus> = {
  0: "Pending",
  1: "Disputed",
  2: "Released",
  3: "Refunded",
};

export const ESCROW_STATUS_COLORS: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-800",
  1: "bg-red-100 text-red-800",
  2: "bg-green-100 text-green-800",
  3: "bg-gray-100 text-gray-800",
};

export interface EscrowEvent {
  type: string;
  id?: string;
  actor?: string;
  amount?: string;
  timestamp: number;
  txHash?: string;
}

export interface Transaction {
  hash: string;
  status: "pending" | "success" | "failed";
  method: string;
  timestamp: number;
  explorerUrl: string;
}
