import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Appointment, AppointmentStatus } from "@/types/firestore";

// Cancelled appointments stay visible (struck through) so the trainer has a
// log of what was on the day. Rescheduled originals are hidden because the new
// appointment row already represents them.
const HIDDEN: ReadonlySet<AppointmentStatus> = new Set(["rescheduled"]);

export function useTodayAppointments(trainerUid: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !trainerUid) {
      setLoading(false);
      return;
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const q = query(
      collection(db, "appointments"),
      where("trainerId", "==", trainerUid),
      where("dateTime", ">=", Timestamp.fromDate(start)),
      where("dateTime", "<", Timestamp.fromDate(end)),
      orderBy("dateTime", "asc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Appointment, "id">) }))
          .filter((a) => !HIDDEN.has(a.status));
        setAppointments(rows);
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [trainerUid]);

  return { appointments, loading, error };
}
