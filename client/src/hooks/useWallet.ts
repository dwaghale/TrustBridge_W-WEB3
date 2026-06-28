"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  StellarWalletsKit,
  Networks,
  KitEventType,
} from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { useWalletStore } from "@/store/walletStore";
import { NETWORK_PASSPHRASE, NETWORK } from "@/lib/constants";

let initialized = false;

function initKit() {
  if (initialized) return;
  StellarWalletsKit.init({
    modules: [new FreighterModule()],
    network:
      NETWORK === "testnet" ? Networks.TESTNET : Networks.PUBLIC,
    selectedWalletId: "freighter",
  });
  initialized = true;
}

export function useWallet() {
  const initializedRef = useRef(false);
  const {
    address,
    isConnected,
    isConnecting,
    error,
    setAddress,
    setConnected,
    setConnecting,
    setError,
    disconnect: storeDisconnect,
  } = useWalletStore();

  useEffect(() => {
    if (!initializedRef.current) {
      initKit();
      initializedRef.current = true;
    }

    // Listen for state changes (disconnect, account switch, etc.)
    const unsub = StellarWalletsKit.on(
      KitEventType.STATE_UPDATED,
      (event) => {
        if (event.payload.address) {
          setAddress(event.payload.address);
          setConnected(true);
        } else {
          setAddress("");
          setConnected(false);
        }
      }
    );

    return () => {
      unsub();
    };
  }, [setAddress, setConnected]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const { address: addr } = await StellarWalletsKit.authModal();
      setAddress(addr);
      setConnected(true);
      setConnecting(false);
    } catch (err: any) {
      setConnecting(false);
      const msg = err?.message || "";
      if (msg.includes("reject") || msg.includes("cancel")) {
        setError("Connection rejected by user");
      } else if (msg.includes("not found") || msg.includes("install")) {
        setError("Wallet not found. Please install Freighter.");
      } else {
        setError(msg || "Failed to connect wallet");
      }
    }
  }, [setAddress, setConnected, setConnecting, setError]);

  const disconnect = useCallback(async () => {
    try {
      await StellarWalletsKit.disconnect();
    } catch {
      // Wallet might not support disconnect
    }
    storeDisconnect();
  }, [storeDisconnect]);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address,
      });
      return signedTxXdr;
    },
    [address]
  );

  return {
    address,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    signTransaction,
  };
}
