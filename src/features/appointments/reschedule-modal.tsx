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
import { LinearGradient } from "expo-linear-gradient";
import { DateTimeField } from "@/components/datetime-field";
import { rescheduleAppointment } from "@/features/appointments/actions";
import { useClient } from "@/features/clients/use-client";
import { colors, gradients } from "@/lib/theme";
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
              style={styles.btnGhost}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.btnGhostText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btnWrap, !canSave && styles.btnDisabled]}
              onPress={onSave}
              disabled={!canSave}
            >
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnPrimary}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.bg} />
                ) : (
                  <Text style={styles.btnPrimaryText}>Save</Text>
                )}
              </LinearGradient>
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
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    gap: 10,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 10px 30px rgba(0,0,0,0.5)" as unknown as never }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.4,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 16,
          elevation: 6,
        }),
  },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  client: { fontSize: 15, color: colors.text, fontWeight: "600" },
  currently: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  label: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: 4,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  warn: { fontSize: 12, color: colors.danger },
  error: { fontSize: 13, color: colors.danger },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 12 },
  btnGhost: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 96,
    alignItems: "center",
  },
  btnGhostText: { color: colors.textMuted, fontWeight: "700" },
  btnWrap: {
    borderRadius: 10,
    overflow: "hidden",
    minWidth: 96,
  },
  btnPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  btnPrimaryText: { color: colors.bg, fontWeight: "800" },
  btnDisabled: { opacity: 0.4 },
});
