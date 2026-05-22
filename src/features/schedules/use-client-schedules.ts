import { useEffect, useState } from "react";
import {
  Timestamp,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Schedule } from "@/types/firestore";

export function useActiveClientSchedules(clientId: string | undefined) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const trainerId = useAuth((s) => s.user?.uid);

  useEffect(() => {
    if (!db || !clientId || !trainerId) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "schedules"),
      where("trainerId", "==", trainerId),
      where("clientId", "==", clientId),
    );
    return onSnapshot(q, (snap) => {
      const today = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));
      const active = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Schedule, "id">) }))
        .filter((s) => s.endDate === null || s.endDate.toMillis() >= today.toMillis())
        .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
      setSchedules(active);
      setLoading(false);
    });
  }, [clientId, trainerId]);

  return { schedules, loading };
}
