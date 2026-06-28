// Replace with your deployed contract address
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "testnet";

export const POLL_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_POLL_INTERVAL || "5000"
);

export const STELLAR_EXPERT_URL =
  NETWORK === "testnet"
    ? "https://stellar.expert/explorer/testnet"
    : "https://stellar.expert/explorer/public";
