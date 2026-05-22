import { Timestamp, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

function requireDb() {
  if (!db) throw new Error("Firestore not configured");
  return db;
}

type Args = {
  clientId: string;
  dateTime: Date;
  durationMinutes: number;
};

export async function createOneOffAppointment({
  clientId,
  dateTime,
  durationMinutes,
}: Args): Promise<void> {
  const firestore = requireDb();
  const trainerId = useAuth.getState().user?.uid;
  if (!trainerId) throw new Error("Not signed in");

  await addDoc(collection(firestore, "appointments"), {
    clientId,
    trainerId,
    scheduleId: null,
    dateTime: Timestamp.fromDate(dateTime),
    durationMinutes,
    status: "scheduled",
    billingStatus: "outstanding",
    createdAt: Timestamp.now(),
  });
}
