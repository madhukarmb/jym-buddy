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
import { colors } from "@/lib/theme";

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
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  enrolBtn: {
    backgroundColor: colors.mint,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  enrolBtnText: { color: colors.bg, fontWeight: "700", fontSize: 14 },
  center: { padding: 32, alignItems: "center" },
  errorCard: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: 12,
    padding: 12,
  },
  errorText: { color: colors.danger },
  empty: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 4,
  },
  muted: { color: colors.text, fontSize: 15 },
  hint: { color: colors.textMuted, fontSize: 13 },
  list: { gap: 10, paddingBottom: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mintSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.mint, fontWeight: "800", fontSize: 16 },
  rowText: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  email: { fontSize: 13, color: colors.textMuted },
});
