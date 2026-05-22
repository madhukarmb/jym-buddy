import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, Redirect, router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useClient } from "@/features/clients/use-client";
import { ActiveSchedulesSection } from "@/features/schedules/active-schedules-section";
import { colors } from "@/lib/theme";

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
      <Link href={{ pathname: "/sessions/[clientId]", params: { clientId: id } }} asChild>
        <Pressable style={styles.shortcutSecondary}>
          <Text style={styles.shortcutSecondaryText}>View Sessions for this client</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: colors.bg, flexGrow: 1 },
  back: { paddingVertical: 4 },
  backText: { color: colors.mint, fontSize: 15, fontWeight: "700" },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.mintSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.mint, fontWeight: "800", fontSize: 24 },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  email: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  shortcut: {
    backgroundColor: colors.mint,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  shortcutText: { color: colors.bg, fontWeight: "700" },
  shortcutSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.lavender,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  shortcutSecondaryText: { color: colors.lavender, fontWeight: "700" },
});
