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
import { useAuth } from "@/lib/auth";
import { useTodayAppointments } from "@/features/appointments/use-today-appointments";
import { useClients } from "@/features/clients/use-clients";
import { TodayAppointmentRow } from "@/features/appointments/today-appointment-row";
import { EnrolClientModal } from "@/features/clients/enrol-client-modal";
import { colors } from "@/lib/theme";
import type { Client } from "@/types/firestore";

const HOME_TILE_LIMIT = 6;

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function ClientTile({ client, variant }: { client: Client; variant: "mint" | "lavender" }) {
  const initial = client.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <Link href={{ pathname: "/client/[id]", params: { id: client.id } }} asChild>
      <Pressable style={variant === "mint" ? styles.tileMint : styles.tileLavender}>
        <View style={styles.tileAvatar}>
          <Text style={styles.tileAvatarText}>{initial}</Text>
        </View>
        <Text style={styles.tileName} numberOfLines={2}>
          {client.name}
        </Text>
      </Pressable>
    </Link>
  );
}

export default function TrainerHome() {
  const user = useAuth((s) => s.user);
  const { appointments, loading, error } = useTodayAppointments(user?.uid);
  const { clients, loading: clientsLoading } = useClients();
  const [enrolling, setEnrolling] = useState(false);

  const firstName = (user?.displayName ?? "").split(" ")[0] || "Trainer";
  const today = dateFmt.format(new Date());
  const homeClients = clients.slice(0, HOME_TILE_LIMIT);
  const hasMoreClients = clients.length > HOME_TILE_LIMIT;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={styles.greeting}>{firstName}</Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      <Text style={styles.sectionTitle}>Today&rsquo;s Appointments</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.mint} />
        </View>
      ) : error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Couldn&rsquo;t load appointments</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>No appointments today.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {appointments.map((a) => (
            <TodayAppointmentRow key={a.id} appointment={a} />
          ))}
        </View>
      )}

      <View style={styles.clientsHead}>
        <Text style={styles.sectionTitle}>Your Clients</Text>
        <View style={styles.clientsHeadActions}>
          <Pressable hitSlop={8} onPress={() => setEnrolling(true)}>
            <Text style={styles.enrolPill}>+ Enrol</Text>
          </Pressable>
          {hasMoreClients ? (
            <Link href="/clients" asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.viewAll}>View all ›</Text>
              </Pressable>
            </Link>
          ) : null}
        </View>
      </View>

      {clientsLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.mint} />
        </View>
      ) : clients.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>No clients yet.</Text>
          <Pressable onPress={() => setEnrolling(true)}>
            <Text style={styles.enrolHint}>Enrol your first client →</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.tileGrid}>
          {homeClients.map((c, i) => (
            <ClientTile key={c.id} client={c} variant={i % 2 === 0 ? "mint" : "lavender"} />
          ))}
        </View>
      )}

      <EnrolClientModal visible={enrolling} onClose={() => setEnrolling(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: colors.bg, flexGrow: 1 },
  welcome: { fontSize: 13, color: colors.textMuted, fontStyle: "italic" },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  date: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 8,
  },
  clientsHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientsHeadActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  viewAll: { color: colors.mint, fontSize: 13, fontWeight: "700" },
  enrolPill: {
    color: colors.bg,
    backgroundColor: colors.mint,
    fontSize: 12,
    fontWeight: "800",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    overflow: "hidden",
  },
  list: { gap: 10 },
  empty: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  muted: { color: colors.textMuted },
  enrolHint: { color: colors.mint, fontWeight: "700" },
  center: { padding: 16, alignItems: "center" },
  errorCard: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  errorTitle: { fontWeight: "700", color: colors.danger },
  errorText: { color: colors.danger, fontSize: 12 },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tileMint: {
    flexBasis: "47%",
    flexGrow: 1,
    aspectRatio: 1.4,
    backgroundColor: colors.mint,
    borderRadius: 16,
    padding: 14,
    justifyContent: "space-between",
  },
  tileLavender: {
    flexBasis: "47%",
    flexGrow: 1,
    aspectRatio: 1.4,
    backgroundColor: colors.lavender,
    borderRadius: 16,
    padding: 14,
    justifyContent: "space-between",
  },
  tileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(14,16,21,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  tileAvatarText: { color: colors.bg, fontWeight: "800", fontSize: 16 },
  tileName: {
    color: colors.bg,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
