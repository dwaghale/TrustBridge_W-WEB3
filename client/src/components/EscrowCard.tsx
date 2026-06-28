"use client";

import { Escrow, ESCROW_STATUS_MAP, ESCROW_STATUS_COLORS } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress, formatAmount } from "@/lib/utils";
import {
  useApproveEscrow,
  useFlagDispute,
  useRefundEscrow,
} from "@/hooks/useContract";
import { useWallet } from "@/hooks/useWallet";
import {
  CheckIcon,
  AlertTriangleIcon,
  RotateCcwIcon,
  Loader2Icon,
  UserIcon,
  GavelIcon,
  CoinsIcon,
} from "lucide-react";

interface EscrowCardProps {
  id: number;
  escrow?: Escrow;
  isLoading?: boolean;
}

export function EscrowCard({ id, escrow, isLoading }: EscrowCardProps) {
  const { address } = useWallet();
  const approve = useApproveEscrow();
  const flagDispute = useFlagDispute();
  const refund = useRefundEscrow();

  if (isLoading || !escrow) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  const statusLabel = ESCROW_STATUS_MAP[escrow.status] || "Unknown";
  const statusColor = ESCROW_STATUS_COLORS[escrow.status] || "";
  const isBuyer = address === escrow.buyer;
  const isSeller = address === escrow.seller;
  const isArbitrator = address === escrow.arbitrator;
  const isPending = escrow.status === 0;
  const isDisputed = escrow.status === 1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Escrow #{id}
            <Badge className={statusColor}>{statusLabel}</Badge>
          </CardTitle>
          <p className="text-sm text-zinc-500 mt-1">
            {formatAmount(escrow.amount)}{" "}
            {truncateAddress(escrow.token)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-zinc-400" />
          <span className="text-zinc-500">Buyer:</span>
          <span className={isBuyer ? "font-semibold" : ""}>
            {truncateAddress(escrow.buyer)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-zinc-400" />
          <span className="text-zinc-500">Seller:</span>
          <span className={isSeller ? "font-semibold" : ""}>
            {truncateAddress(escrow.seller)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <GavelIcon className="h-4 w-4 text-zinc-400" />
          <span className="text-zinc-500">Arbitrator:</span>
          <span className={isArbitrator ? "font-semibold" : ""}>
            {truncateAddress(escrow.arbitrator)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CoinsIcon className="h-4 w-4 text-zinc-400" />
          <span className="text-zinc-500">Amount:</span>
          <span>{formatAmount(escrow.amount)}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span>
            Buyer {escrow.buyer_approved ? "✅" : "⏳"} approved
          </span>
          <span>
            Seller {escrow.seller_approved ? "✅" : "⏳"} approved
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {isPending && (isBuyer || isSeller) && !(
          (isBuyer && escrow.buyer_approved) ||
          (isSeller && escrow.seller_approved)
        ) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => approve.mutate({ id })}
            disabled={approve.isPending}
          >
            {approve.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <CheckIcon className="h-4 w-4 mr-1" />
            )}
            Approve
          </Button>
        )}
        {isPending && (isBuyer || isSeller) && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => flagDispute.mutate({ id })}
            disabled={flagDispute.isPending}
          >
            {flagDispute.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <AlertTriangleIcon className="h-4 w-4 mr-1" />
            )}
            Flag Dispute
          </Button>
        )}
        {isPending && isBuyer && !escrow.buyer_approved && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refund.mutate({ id })}
            disabled={refund.isPending}
          >
            {refund.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RotateCcwIcon className="h-4 w-4 mr-1" />
            )}
            Refund
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
