import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";
import { useClients } from "@/features/clients/use-clients";
import { EnrolClientModal } from "@/features/clients/enrol-client-modal";
import type { Client } from "@/types/firestore";

export default function ClientsList() {
  const { clients, loading, error } = useClients();
  const [enrolling, setEnrolling] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <Pressable style={styles.enrolBtn} onPress={() => setEnrolling(true)}>
          <Text style={styles.enrolBtnText}>+ Enrol Client</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : clients.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>No clients yet.</Text>
          <Text style={styles.hint}>Tap “+ Enrol Client” to add the first one.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {clients.map((c) => (
            <ClientRow key={c.id} client={c} />
          ))}
        </ScrollView>
      )}

      <EnrolClientModal visible={enrolling} onClose={() => setEnrolling(false)} />
    </View>
  );
}

function ClientRow({ client }: { client: Client }) {
  const initial = client.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <Link href={{ pathname: "/client/[id]", params: { id: client.id } }} asChild>
      <Pressable style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.rowText}>
          <Text style={styles.name}>{client.name}</Text>
          <Text style={styles.email}>{client.email}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 22, fontWeight: "700" },
  enrolBtn: {
    backgroundColor: "#208AEF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  enrolBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  center: { padding: 32, alignItems: "center" },
  errorCard: {
    borderWidth: 1,
    borderColor: "#ffcdd2",
    backgroundColor: "#ffebee",
    borderRadius: 8,
    padding: 12,
  },
  errorText: { color: "#c62828" },
  empty: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    gap: 4,
  },
  muted: { color: "#444", fontSize: 15 },
  hint: { color: "#888", fontSize: 13 },
  list: { gap: 10, paddingBottom: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#0d47a1", fontWeight: "700" },
  rowText: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600" },
  email: { fontSize: 13, color: "#666" },
});
