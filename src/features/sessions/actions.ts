import {
  Timestamp,
  collection,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { AppointmentStatus } from "@/types/firestore";

function requireDb() {
  if (!db) throw new Error("Firestore not configured");
  return db;
}

export async function setAttendanceStatus(
  appointmentId: string,
  status: Extract<AppointmentStatus, "checked_in" | "no_show">,
): Promise<void> {
  const firestore = requireDb();
  const batch = writeBatch(firestore);
  batch.update(doc(firestore, "appointments", appointmentId), { status });
  await batch.commit();
}

export async function closeBilling(args: {
  clientId: string;
  appointmentIds: string[];
  amountPaid: number;
}): Promise<void> {
  const firestore = requireDb();
  const trainerId = useAuth.getState().user?.uid;
  if (!trainerId) throw new Error("Not signed in");
  if (args.appointmentIds.length === 0) throw new Error("No sessions selected");
  if (!Number.isInteger(args.amountPaid) || args.amountPaid <= 0) {
    throw new Error("Amount must be a positive whole number");
  }

  const closureRef = doc(collection(firestore, "billingClosures"));
  const batch = writeBatch(firestore);

  batch.set(closureRef, {
    clientId: args.clientId,
    trainerId,
    closedAt: Timestamp.now(),
    sessionCount: args.appointmentIds.length,
    amountPaid: args.amountPaid,
  });

  for (const id of args.appointmentIds) {
    batch.update(doc(firestore, "appointments", id), {
      billingStatus: "billed",
      billingClosureId: closureRef.id,
    });
  }

  await batch.commit();
}
