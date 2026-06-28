"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useCreateEscrow } from "@/hooks/useContract";
import { useWallet } from "@/hooks/useWallet";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toBaseUnits } from "@/lib/utils";

const USDC_TESTNET = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

export function CreateEscrowForm() {
  const { isConnected } = useWallet();
  const createEscrow = useCreateEscrow();
  const [seller, setSeller] = useState("");
  const [arbitrator, setArbitrator] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState(USDC_TESTNET);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller || !arbitrator || !amount) return;
    try {
      await createEscrow.mutateAsync({
        seller,
        arbitrator,
        token,
        amount: toBaseUnits(amount),
      });
      setSeller("");
      setArbitrator("");
      setAmount("");
    } catch {
      // error handled by mutation
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-zinc-500">
          Connect your wallet to create an escrow
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Create Escrow
        </CardTitle>
        <CardDescription>
          Deposit tokens into a new escrow agreement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Token Contract</label>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token contract address (C...)"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Seller Address</label>
            <Input
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              placeholder="G... or C..."
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Arbitrator Address</label>
            <Input
              value={arbitrator}
              onChange={(e) => setArbitrator(e.target.value)}
              placeholder="G... or C..."
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 100"
              type="number"
              step="0.0000001"
              min="0"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createEscrow.isPending || !seller || !arbitrator || !amount}
          >
            {createEscrow.isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Escrow"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
