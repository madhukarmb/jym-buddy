import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useClient } from "@/features/clients/use-client";
import { useOutstandingSessions } from "@/features/sessions/use-outstanding-sessions";
import { setAttendanceStatus } from "@/features/sessions/actions";
import { CloseBillingModal } from "@/features/sessions/close-billing-modal";
import type { Appointment } from "@/types/firestore";

const dtFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export default function ClientLedger() {
  const role = useAuth((s) => s.user?.role);
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const client = useClient(clientId);
  const { sessions, loading } = useOutstandingSessions(clientId);
  const [closing, setClosing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (role !== "trainer") return <Redirect href="/" />;

  const countable = sessions.filter(
    (s) => s.status === "checked_in" || s.status === "no_show",
  );

  const setStatus = async (id: string, status: "checked_in" | "no_show") => {
    setBusyId(id);
    setError(null);
    try {
      await setAttendanceStatus(id, status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const initial = client?.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.clientName}>{client?.name ?? "…"}</Text>
          <Text style={styles.outstandingLabel}>Outstanding sessions</Text>
          <Text style={styles.outstandingCount}>{countable.length}</Text>
        </View>
      </View>

      {countable.length > 0 ? (
        <Pressable style={styles.closeBtn} onPress={() => setClosing(true)}>
          <Text style={styles.closeBtnText}>Close Billing</Text>
        </Pressable>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>No outstanding sessions.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {sessions.map((s) => (
            <SessionRow
              key={s.id}
              session={s}
              busy={busyId === s.id}
              onSetStatus={(st) => setStatus(s.id, st)}
            />
          ))}
        </View>
      )}

      <CloseBillingModal
        visible={closing}
        clientId={clientId ?? ""}
        clientName={client?.name ?? ""}
        sessions={countable}
        onClose={() => setClosing(false)}
      />
    </ScrollView>
  );
}

function SessionRow({
  session,
  busy,
  onSetStatus,
}: {
  session: Appointment;
  busy: boolean;
  onSetStatus: (s: "checked_in" | "no_show") => void;
}) {
  const time = dtFmt.format(session.dateTime.toDate());
  const isScheduled = session.status === "scheduled";

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.time, isScheduled && styles.needsAction]}>{time}</Text>
        <Text style={styles.statusText}>{statusLabel(session.status)}</Text>
      </View>
      {busy ? (
        <ActivityIndicator />
      ) : isScheduled ? (
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, styles.checkInBtn]}
            onPress={() => onSetStatus("checked_in")}
          >
            <Text style={styles.checkInText}>Check-in</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.noShowBtn]}
            onPress={() => onSetStatus("no_show")}
          >
            <Text style={styles.noShowText}>No Show</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.toggle}
          onPress={() =>
            onSetStatus(session.status === "checked_in" ? "no_show" : "checked_in")
          }
        >
          <Text style={styles.toggleText}>Toggle</Text>
        </Pressable>
      )}
    </View>
  );
}

function statusLabel(status: Appointment["status"]): string {
  if (status === "checked_in") return "Checked in";
  if (status === "no_show") return "No-show";
  if (status === "scheduled") return "Needs attendance mark";
  return status;
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  back: { paddingVertical: 4 },
  backText: { color: "#208AEF", fontSize: 15, fontWeight: "600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
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
  clientName: { fontSize: 18, fontWeight: "700" },
  outstandingLabel: { fontSize: 12, color: "#666", marginTop: 6 },
  outstandingCount: { fontSize: 32, fontWeight: "700", color: "#208AEF" },
  closeBtn: {
    backgroundColor: "#208AEF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  closeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  list: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
    gap: 12,
  },
  time: { fontSize: 15, fontWeight: "600" },
  needsAction: { color: "#e65100" },
  statusText: { fontSize: 13, color: "#666", marginTop: 2 },
  actions: { flexDirection: "row", gap: 6 },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  checkInBtn: { borderColor: "#2e7d32" },
  checkInText: { color: "#2e7d32", fontWeight: "600", fontSize: 13 },
  noShowBtn: { borderColor: "#c62828" },
  noShowText: { color: "#c62828", fontWeight: "600", fontSize: 13 },
  toggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#888",
  },
  toggleText: { color: "#444", fontWeight: "600", fontSize: 13 },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
  },
  muted: { color: "#666" },
  center: { padding: 32, alignItems: "center" },
  error: { color: "#c62828", fontSize: 13 },
});
