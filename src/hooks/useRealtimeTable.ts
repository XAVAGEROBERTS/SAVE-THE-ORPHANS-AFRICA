"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface RealtimeOptions<T> {
  table: string;
  initialData?: T[];
  orderBy?: { column: string; ascending?: boolean };
  filter?: { column: string; value: string | number | boolean };
}

export function useRealtimeTable<T extends { id: string }>({
  table,
  initialData = [],
  orderBy,
  filter,
}: RealtimeOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(initialData.length === 0);

  const load = useCallback(async () => {
    const supabase = createClient();
    let query = supabase.from(table).select("*");

    if (filter) {
      query = query.eq(filter.column, filter.value);
    }

    if (orderBy) {
      query = query.order(orderBy.column, {
        ascending: orderBy.ascending ?? true,
      });
    }

    const { data: result, error } = await query;
    if (error) {
      console.error(`Failed to load ${table}:`, error.message);
    }
    if (result) setData(result as T[]);
    setIsLoading(false);
  }, [table, filter?.column, filter?.value, orderBy?.column, orderBy?.ascending]);

  useEffect(() => {
    load();

    const supabase = createClient();
    const channelName = `realtime-${table}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload.eventType);

          setData((current) => {
            const row = payload.new as T;

            if (payload.eventType === "INSERT") {
              return [row, ...current];
            }

            if (payload.eventType === "UPDATE") {
              return current.map((item) =>
                item.id === row.id ? row : item
              );
            }

            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as Partial<T>;
              return current.filter((item) => item.id !== oldRow.id);
            }

            return current;
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Realtime subscribed to ${table}`);
        }
        if (status === "CHANNEL_ERROR") {
          console.error(`Realtime error on ${table}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, load]);

  return {
    data,
    setData,
    isLoading,
    reload: load,
  };
}