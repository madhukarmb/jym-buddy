import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DateTimeField } from "@/components/datetime-field";
import { rescheduleAppointment } from "@/features/appointments/actions";
import { useClient } from "@/features/clients/use-client";
import type { Appointment } from "@/types/firestore";

const currentFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

type Props = {
  appointment: Appointment;
  visible: boolean;
  onClose: () => void;
};

export function RescheduleModal({ appointment, visible, onClose }: Props) {
  const client = useClient(appointment.clientId);
  const original = appointment.dateTime.toDate();

  // Default proposed time: original time, but if it's in the past, bump to one
  // hour from now.
  const [next, setNext] = useState<Date>(() => {
    const proposed = new Date(original);
    const now = new Date();
    if (proposed <= now) {
      proposed.setTime(now.getTime() + 60 * 60 * 1000);
      proposed.setSeconds(0, 0);
    }
    return proposed;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFuture = next.getTime() > Date.now();
  const canSave = isFuture && !submitting;

  const onSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    setError(null);
    try {
      await rescheduleAppointment(appointment, next);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reschedule failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Reschedule appointment</Text>
          <Text style={styles.client}>{client?.name ?? "…"}</Text>
          <Text style={styles.currently}>
            Currently: {currentFmt.format(original)}
          </Text>

          <Text style={styles.label}>New date &amp; time</Text>
          <DateTimeField value={next} minimumDate={new Date()} onChange={setNext} />

          {!isFuture ? (
            <Text style={styles.warn}>Pick a time strictly in the future.</Text>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, styles.btnGhost]}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.btnGhostText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary, !canSave && styles.btnDisabled]}
              onPress={onSave}
              disabled={!canSave}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>Save</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    gap: 10,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 10px 30px rgba(0,0,0,0.2)" as unknown as never }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 16,
          elevation: 6,
        }),
  },
  title: { fontSize: 18, fontWeight: "700" },
  client: { fontSize: 15, color: "#444" },
  currently: { fontSize: 13, color: "#777", marginBottom: 4 },
  label: { fontSize: 12, color: "#666", marginTop: 4, textTransform: "uppercase" },
  warn: { fontSize: 12, color: "#c62828" },
  error: { fontSize: 13, color: "#c62828" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 12 },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 96,
  },
  btnGhost: { backgroundColor: "transparent" },
  btnGhostText: { color: "#444", fontWeight: "600" },
  btnPrimary: { backgroundColor: "#208AEF" },
  btnPrimaryText: { color: "#fff", fontWeight: "600" },
  btnDisabled: { opacity: 0.5 },
});
