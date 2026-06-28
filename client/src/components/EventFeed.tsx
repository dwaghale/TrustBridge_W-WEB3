"use client";

import { useEscrowEvents } from "@/hooks/useEscrowEvents";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/utils";

const EVENT_COLORS: Record<string, "success" | "warning" | "default" | "destructive" | "secondary"> = {
  Created: "success",
  Approved: "secondary",
  Released: "success",
  Disputed: "destructive",
  Resolved: "warning",
  Refunded: "default",
};

export function EventFeed() {
  const { events, isLoading, refresh } = useEscrowEvents();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ActivityIcon className="h-5 w-5" />
          Event Feed
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
          <RefreshCwIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <ActivityIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events yet. Create an escrow to get started.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {events.map((event, i) => (
              <div
                key={`${event.type}-${event.txHash}-${i}`}
                className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={EVENT_COLORS[event.type.split(":")[0]] || "default"}
                    className="capitalize"
                  >
                    {event.type.split(":")[0] || event.type}
                  </Badge>
                  {event.actor && (
                    <span className="text-zinc-500">{truncateAddress(event.actor)}</span>
                  )}
                </div>
                <span className="text-xs text-zinc-400">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
