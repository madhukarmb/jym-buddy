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
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/lib/auth";
import { useTodayAppointments } from "@/features/appointments/use-today-appointments";
import { useClients } from "@/features/clients/use-clients";
import { TodayAppointmentRow } from "@/features/appointments/today-appointment-row";
import { EnrolClientModal } from "@/features/clients/enrol-client-modal";
import { useOutstandingByClient } from "@/features/sessions/use-outstanding-by-client";
import { colors, gradients } from "@/lib/theme";
import type { Client } from "@/types/firestore";

const HOME_TILE_LIMIT = 6;

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function ClientTile({
  client,
  outstanding,
}: {
  client: Client;
  outstanding: number;
}) {
  const initial = client.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <Link href={{ pathname: "/client/[id]", params: { id: client.id } }} asChild>
      <Pressable style={styles.tileWrap}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tile}
        >
          <View style={styles.tileTop}>
            <View style={styles.tileAvatar}>
              <Text style={styles.tileAvatarText}>{initial}</Text>
            </View>
            {outstanding > 0 ? (
              <View style={styles.badge} accessibilityLabel={`${outstanding} outstanding`}>
                <Text style={styles.badgeText}>{outstanding}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.tileName} numberOfLines={2}>
            {client.name}
          </Text>
        </LinearGradient>
      </Pressable>
    </Link>
  );
}

export default function TrainerHome() {
  const user = useAuth((s) => s.user);
  const { appointments, loading, error } = useTodayAppointments(user?.uid);
  const { clients, loading: clientsLoading } = useClients();
  const outstandingByClient = useOutstandingByClient();
  const [enrolling, setEnrolling] = useState(false);

  const today = dateFmt.format(new Date());
  const homeClients = clients.slice(0, HOME_TILE_LIMIT);
  const hasMoreClients = clients.length > HOME_TILE_LIMIT;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.date}>{today}</Text>

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
          {homeClients.map((c) => (
            <ClientTile
              key={c.id}
              client={c}
              outstanding={outstandingByClient[c.id] ?? 0}
            />
          ))}
        </View>
      )}

      <EnrolClientModal visible={enrolling} onClose={() => setEnrolling(false)} />
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
  date: { fontSize: 13, color: colors.textMuted, fontStyle: "italic" },
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
  tileWrap: {
    flexBasis: "47%",
    aspectRatio: 1.4,
    borderRadius: 16,
    overflow: "hidden",
  },
  tile: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  tileTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(14,16,21,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  tileAvatarText: { color: colors.bg, fontWeight: "800", fontSize: 16 },
  badge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  tileName: {
    color: colors.bg,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
