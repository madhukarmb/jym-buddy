import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { closeBilling } from "./actions";
import { colors, gradients } from "@/lib/theme";
import type { Appointment } from "@/types/firestore";

type Props = {
  visible: boolean;
  clientId: string;
  clientName: string;
  sessions: Appointment[];
  onClose: () => void;
};

const dtFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

function statusLabel(status: Appointment["status"]): string {
  if (status === "checked_in") return "Checked in";
  if (status === "no_show") return "No-show";
  return "Unmarked";
}

export function CloseBillingModal({
  visible,
  clientId,
  clientName,
  sessions,
  onClose,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSelected(new Set(sessions.map((s) => s.id)));
      setAmount("");
      setError(null);
      setSubmitting(false);
    }
  }, [visible, sessions]);

  const amountInt = Number(amount);
  const amountValid = Number.isInteger(amountInt) && amountInt > 0;
  const canConfirm = selected.size > 0 && amountValid && !submitting;

  const summary = useMemo(
    () => `Closing ${selected.size} of ${sessions.length} sessions for ${clientName}.`,
    [selected.size, sessions.length, clientName],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    setError(null);
    try {
      await closeBilling({
        clientId,
        appointmentIds: Array.from(selected),
        amountPaid: amountInt,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Close Billing</Text>
          <Text style={styles.summary}>{summary}</Text>

          <ScrollView style={styles.list}>
            {sessions.map((s) => {
              const checked = selected.has(s.id);
              return (
                <Pressable
                  key={s.id}
                  style={styles.row}
                  onPress={() => toggle(s.id)}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                    {checked ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTime}>
                      {dtFmt.format(s.dateTime.toDate())}
                    </Text>
                    <Text style={styles.rowStatus}>{statusLabel(s.status)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Amount paid</Text>
          <View style={styles.amountRow}>
            <Text style={styles.rupee}>₹</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textDim}
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ""))}
              editable={!submitting}
            />
          </View>

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
              style={[styles.btnWrap, !canConfirm && styles.btnDisabled]}
              onPress={onConfirm}
              disabled={!canConfirm}
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
                  <Text style={styles.btnPrimaryText}>Confirm</Text>
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
    maxWidth: 480,
    maxHeight: "90%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    gap: 8,
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
  summary: { fontSize: 13, color: colors.textMuted },
  list: { maxHeight: 280, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: colors.mint },
  checkmark: { color: colors.bg, fontWeight: "800", fontSize: 14 },
  rowTime: { fontSize: 14, fontWeight: "700", color: colors.text },
  rowStatus: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  label: {
    fontSize: 11,
    color: colors.textDim,
    textTransform: "uppercase",
    marginTop: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  rupee: { fontSize: 18, color: colors.text, marginRight: 4, fontWeight: "700" },
  amountInput: { flex: 1, fontSize: 16, paddingVertical: 12, color: colors.text },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 12 },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 96,
  },
  btnGhost: { backgroundColor: "transparent" },
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
  error: { color: colors.danger, fontSize: 13, marginTop: 8 },
});
