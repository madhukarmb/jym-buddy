import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Client } from "@/types/firestore";

export function useClient(clientId: string | undefined): Client | null {
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!db || !clientId) return;
    return onSnapshot(doc(db, "clients", clientId), (snap) => {
      if (snap.exists()) {
        setClient({ id: snap.id, ...(snap.data() as Omit<Client, "id">) });
      } else {
        setClient(null);
      }
    });
  }, [clientId]);

  return client;
}
