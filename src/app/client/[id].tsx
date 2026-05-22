import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, Redirect, router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useClient } from "@/features/clients/use-client";
import { ActiveSchedulesSection } from "@/features/schedules/active-schedules-section";

export default function ClientDetail() {
  const role = useAuth((s) => s.user?.role);
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useClient(id);

  if (role !== "trainer") return <Redirect href="/" />;

  const initial = client?.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹ Clients</Text>
      </Pressable>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{client?.name ?? "…"}</Text>
          <Text style={styles.email}>{client?.email ?? "…"}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Active Schedules</Text>
      {id ? <ActiveSchedulesSection clientId={id} /> : null}

      <Text style={styles.sectionTitle}>Shortcuts</Text>
      <Link
        href={{ pathname: "/schedule/new", params: { clientId: id } }}
        asChild
      >
        <Pressable style={styles.shortcut}>
          <Text style={styles.shortcutText}>+ Add Schedule for this client</Text>
        </Pressable>
      </Link>
      <View style={styles.placeholder}>
        <Text style={styles.muted}>“View Sessions” unlocks once Sessions ships.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  back: { paddingVertical: 4 },
  backText: { color: "#208AEF", fontSize: 15, fontWeight: "600" },
  profile: {
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#0d47a1", fontWeight: "700", fontSize: 22 },
  name: { fontSize: 18, fontWeight: "700" },
  email: { fontSize: 14, color: "#666", marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#333", marginTop: 8 },
  placeholder: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
  },
  muted: { color: "#666", fontSize: 13 },
  shortcut: {
    backgroundColor: "#208AEF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  shortcutText: { color: "#fff", fontWeight: "600" },
});
