import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatAmount(amount: string, decimals = 7): string {
  const num = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = num / divisor;
  const fractionalPart = num % divisor;
  const fractional = fractionalPart.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fractional ? `${integerPart}.${fractional}` : integerPart.toString();
}

export function toBaseUnits(amount: string, decimals = 7): bigint {
  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

export function getExplorerUrl(hash: string, network: "testnet" | "mainnet" = "testnet"): string {
  const base = network === "testnet" ? "https://stellar.expert/explorer/testnet" : "https://stellar.expert/explorer/public";
  return `${base}/tx/${hash}`;
}

export function getContractExplorerUrl(address: string, network: "testnet" | "mainnet" = "testnet"): string {
  const base = network === "testnet" ? "https://stellar.expert/explorer/testnet" : "https://stellar.expert/explorer/public";
  return `${base}/contract/${address}`;
}
