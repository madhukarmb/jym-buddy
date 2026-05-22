import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Appointment } from "@/types/firestore";

export function useOutstandingSessions(clientId: string | undefined) {
  const [sessions, setSessions] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const trainerId = useAuth((s) => s.user?.uid);

  useEffect(() => {
    if (!db || !clientId || !trainerId) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "appointments"),
      where("trainerId", "==", trainerId),
      where("clientId", "==", clientId),
      where("billingStatus", "==", "outstanding"),
      orderBy("dateTime", "desc"),
    );
    return onSnapshot(q, (snap) => {
      const nowMs = Date.now();
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Appointment, "id">) }))
        .filter(
          (a) =>
            a.dateTime.toMillis() < nowMs &&
            a.status !== "cancelled" &&
            a.status !== "rescheduled",
        );
      setSessions(rows);
      setLoading(false);
    });
  }, [clientId, trainerId]);

  return { sessions, loading };
}
