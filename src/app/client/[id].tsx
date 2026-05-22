import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, Redirect, router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/lib/auth";
import { useClient } from "@/features/clients/use-client";
import { ActiveSchedulesSection } from "@/features/schedules/active-schedules-section";
import { colors, gradients } from "@/lib/theme";

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

      <View style={styles.shortcutRow}>
        <Link
          href={{ pathname: "/schedule/new", params: { clientId: id } }}
          asChild
        >
          <Pressable style={styles.shortcutWrap}>
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shortcut}
            >
              <Text style={styles.shortcutKicker}>Schedule</Text>
              <Text style={styles.shortcutText}>+ Add</Text>
            </LinearGradient>
          </Pressable>
        </Link>
        <Link href={{ pathname: "/sessions/[clientId]", params: { clientId: id } }} asChild>
          <Pressable style={styles.shortcutWrap}>
            <LinearGradient
              colors={gradients.primaryReverse}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shortcut}
            >
              <Text style={styles.shortcutKicker}>Billing</Text>
              <Text style={styles.shortcutText}>Outstanding</Text>
            </LinearGradient>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    backgroundColor: colors.bg,
    flexGrow: 1,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
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
  shortcutRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  shortcutWrap: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  shortcut: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 4,
  },
  shortcutKicker: {
    color: "rgba(14,16,21,0.55)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  shortcutText: { color: colors.bg, fontWeight: "800", fontSize: 16 },
});
