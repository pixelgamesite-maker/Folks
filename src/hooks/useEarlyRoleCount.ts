import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Live "x / cap" count for the Early Role table (see folks_rename_early_role.sql).
 * Only Early Role is capped — the Whitelist application table is uncapped
 * and has no equivalent counter. Subscribes to realtime updates so the
 * number moves on the page without a refresh.
 *
 * Realtime requires the table to be added to the `supabase_realtime`
 * publication once:
 *   alter publication supabase_realtime add table public.folks_early_role_counter;
 * Without that, this still works fine — it just falls back to whatever it
 * read on mount until the page reloads.
 */
export function useEarlyRoleCount(cap = 1000) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    supabase
      .from("folks_early_role_counter")
      .select("count")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setCount(data.count);
      });

    const channel = supabase
      .channel("folks_early_role_counter_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "folks_early_role_counter" },
        (payload: any) => {
          if (active && typeof payload.new?.count === "number") setCount(payload.new.count);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { count, cap };
}
