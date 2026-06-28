"use client";

import { useState, useEffect, useCallback } from "react";
import { rpc, scValToNative } from "@stellar/stellar-sdk";
import { RPC_URL, CONTRACT_ADDRESS } from "@/lib/constants";
import { EscrowEvent } from "@/types";

export function useEscrowEvents() {
  const [events, setEvents] = useState<EscrowEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return;
    setIsLoading(true);
    try {
      const server = new rpc.Server(RPC_URL);
      const resp = await server.getEvents({
        startLedger: 0,
        filters: [
          {
            contractIds: [CONTRACT_ADDRESS],
            type: "contract",
          },
        ],
        limit: 50,
      });
      const parsed: EscrowEvent[] = resp.events.map((entry) => {
        // First topic is the event struct name (e.g. "Created", "Approved", etc.)
        const topicSymbols = entry.topic.map((t) => {
          try {
            return String(scValToNative(t));
          } catch {
            return "";
          }
        });
        const eventType = topicSymbols[0] || "Unknown";

        return {
          type: eventType,
          id: topicSymbols[1] || undefined,
          actor: topicSymbols[2] || undefined,
          timestamp: new Date(entry.ledgerClosedAt).getTime() || Date.now(),
          txHash: entry.txHash || undefined,
        };
      });
      setEvents((prev) => {
        const existing = new Set(prev.map((e) => `${e.type}-${e.txHash}`));
        const newEvents = parsed.filter(
          (e) => !existing.has(`${e.type}-${e.txHash}`)
        );
        return [...newEvents, ...prev].slice(0, 100);
      });
    } catch {
      // Silently fail on poll — event polling is best-effort
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const addLocalEvent = useCallback((event: EscrowEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 100));
  }, []);

  return { events, isLoading, refresh: fetchEvents, addLocalEvent, setEvents };
}
