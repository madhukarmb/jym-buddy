import {
  Timestamp,
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

function requireDb() {
  if (!db) throw new Error("Firestore not configured");
  return db;
}

export async function endSchedule(scheduleId: string): Promise<void> {
  const firestore = requireDb();
  const trainerId = useAuth.getState().user?.uid;
  if (!trainerId) throw new Error("Not signed in");
  const now = Timestamp.now();
  const today = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));

  const apptQuery = query(
    collection(firestore, "appointments"),
    where("trainerId", "==", trainerId),
    where("scheduleId", "==", scheduleId),
    where("dateTime", ">", now),
  );
  const snap = await getDocs(apptQuery);

  const batch = writeBatch(firestore);
  batch.update(doc(firestore, "schedules", scheduleId), { endDate: today });
  for (const d of snap.docs) {
    if (d.get("status") === "scheduled") batch.delete(d.ref);
  }
  await batch.commit();
}
