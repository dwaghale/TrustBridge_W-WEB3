import { create } from "zustand";

interface WalletState {
  address: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  setAddress: (address: string) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: "",
  isConnected: false,
  isConnecting: false,
  error: null,
  setAddress: (address) => set({ address }),
  setConnected: (connected) => set({ isConnected: connected }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setError: (error) => set({ error }),
  disconnect: () =>
    set({
      address: "",
      isConnected: false,
      isConnecting: false,
      error: null,
    }),
}));
