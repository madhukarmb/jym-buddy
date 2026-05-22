import {
  Timestamp,
  collection,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { ScheduleSlot } from "@/types/firestore";
import { materialiseSchedule } from "./materialise";

function requireDb() {
  if (!db) throw new Error("Firestore not configured");
  return db;
}

type Args = {
  clientId: string;
  slots: ScheduleSlot[];
  startDate: Date;
  endDate: Date | null;
};

export async function createRecurringSchedule({
  clientId,
  slots,
  startDate,
  endDate,
}: Args): Promise<string> {
  const firestore = requireDb();
  const trainerId = useAuth.getState().user?.uid;
  if (!trainerId) throw new Error("Not signed in");

  const scheduleRef = doc(collection(firestore, "schedules"));
  const drafts = materialiseSchedule({ slots, startDate, endDate });

  const batch = writeBatch(firestore);
  batch.set(scheduleRef, {
    clientId,
    trainerId,
    slots,
    startDate: Timestamp.fromDate(startDate),
    endDate: endDate ? Timestamp.fromDate(endDate) : null,
    createdAt: Timestamp.now(),
  });

  for (const draft of drafts) {
    const apptRef = doc(collection(firestore, "appointments"));
    batch.set(apptRef, {
      clientId,
      trainerId,
      scheduleId: scheduleRef.id,
      dateTime: Timestamp.fromDate(draft.dateTime),
      durationMinutes: draft.durationMinutes,
      status: "scheduled",
      billingStatus: "outstanding",
      createdAt: Timestamp.now(),
    });
  }

  await batch.commit();
  return scheduleRef.id;
}
