import {
  collection,
  doc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Appointment, AppointmentStatus } from "@/types/firestore";

function requireDb() {
  if (!db) throw new Error("Firebase not configured");
  return db;
}

function setStatus(appointmentId: string, status: AppointmentStatus) {
  return updateDoc(doc(requireDb(), "appointments", appointmentId), { status });
}

export const checkIn = (id: string) => setStatus(id, "checked_in");
export const markNoShow = (id: string) => setStatus(id, "no_show");
export const cancelAppointment = (id: string) => setStatus(id, "cancelled");

export async function rescheduleAppointment(
  original: Appointment,
  newDateTime: Date,
): Promise<void> {
  const firestore = requireDb();
  const batch = writeBatch(firestore);

  const originalRef = doc(firestore, "appointments", original.id);
  batch.update(originalRef, { status: "rescheduled" });

  const newRef = doc(collection(firestore, "appointments"));
  batch.set(newRef, {
    clientId: original.clientId,
    trainerId: original.trainerId,
    scheduleId: null,
    dateTime: Timestamp.fromDate(newDateTime),
    durationMinutes: original.durationMinutes,
    status: "scheduled",
    billingStatus: "outstanding",
    createdAt: Timestamp.now(),
  });

  await batch.commit();
}
