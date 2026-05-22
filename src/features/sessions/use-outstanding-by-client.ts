import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Appointment } from "@/types/firestore";

export function useOutstandingByClient(): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const trainerId = useAuth((s) => s.user?.uid);

  useEffect(() => {
    if (!db || !trainerId) {
      setCounts({});
      return;
    }
    const q = query(
      collection(db, "appointments"),
      where("trainerId", "==", trainerId),
      where("billingStatus", "==", "outstanding"),
    );
    return onSnapshot(q, (snap) => {
      const nowMs = Date.now();
      const next: Record<string, number> = {};
      snap.forEach((d) => {
        const data = d.data() as Omit<Appointment, "id">;
        if (data.dateTime.toMillis() >= nowMs) return;
        if (data.status !== "checked_in" && data.status !== "no_show") return;
        next[data.clientId] = (next[data.clientId] ?? 0) + 1;
      });
      setCounts(next);
    });
  }, [trainerId]);

  return counts;
}
