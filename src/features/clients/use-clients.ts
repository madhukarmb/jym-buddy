import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Client } from "@/types/firestore";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, "clients"), orderBy("name", "asc"));
    return onSnapshot(
      q,
      (snap) => {
        setClients(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Client, "id">) })),
        );
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );
  }, []);

  return { clients, loading, error };
}
