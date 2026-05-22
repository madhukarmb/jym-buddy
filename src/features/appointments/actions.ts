import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppointmentStatus } from "@/types/firestore";

function appointmentRef(appointmentId: string) {
  if (!db) throw new Error("Firebase not configured");
  return doc(db, "appointments", appointmentId);
}

function setStatus(appointmentId: string, status: AppointmentStatus) {
  return updateDoc(appointmentRef(appointmentId), { status });
}

export const checkIn = (id: string) => setStatus(id, "checked_in");
export const markNoShow = (id: string) => setStatus(id, "no_show");
export const cancelAppointment = (id: string) => setStatus(id, "cancelled");
