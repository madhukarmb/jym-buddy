import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useActiveClientSchedules } from "./use-client-schedules";
import { endSchedule } from "./end-schedule";
import type { Schedule, Weekday } from "@/types/firestore";

const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

function formatSlot(slot: Schedule["slots"][number]): string {
  const h12 = ((slot.startHour + 11) % 12) + 1;
  const ampm = slot.startHour >= 12 ? "PM" : "AM";
  const mm = slot.startMinute.toString().padStart(2, "0");
  return `${WEEKDAY_LABELS[slot.weekday]} ${h12}:${mm} ${ampm} · ${slot.durationMinutes}m`;
}

function confirm(message: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(typeof window !== "undefined" && window.confirm(message));
  }
  return new Promise((resolve) => {
    Alert.alert("End schedule", message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: "End", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

export function ActiveSchedulesSection({ clientId }: { clientId: string }) {
  const { schedules, loading } = useActiveClientSchedules(clientId);
  const [endingId, setEndingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onEnd = async (id: string) => {
    const ok = await confirm(
      "End this schedule? Future appointments will be removed; past attendance is kept.",
    );
    if (!ok) return;
    setEndingId(id);
    setError(null);
    try {
      await endSchedule(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "End failed");
    } finally {
      setEndingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (schedules.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.muted}>No active schedules.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {schedules.map((s) => (
        <View key={s.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            {s.slots.map((slot, i) => (
              <Text key={i} style={styles.slot}>
                {formatSlot(slot)}
              </Text>
            ))}
            {s.endDate ? (
              <Text style={styles.until}>
                Until {s.endDate.toDate().toLocaleDateString()}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => onEnd(s.id)}
            disabled={endingId === s.id}
            style={[styles.endBtn, endingId === s.id && styles.endBtnDisabled]}
          >
            {endingId === s.id ? (
              <ActivityIndicator color="#c62828" />
            ) : (
              <Text style={styles.endBtnText}>End</Text>
            )}
          </Pressable>
        </View>
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { padding: 16, alignItems: "center" },
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
  slot: { fontSize: 14, color: "#333" },
  until: { fontSize: 12, color: "#888", marginTop: 4 },
  endBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c62828",
  },
  endBtnDisabled: { opacity: 0.6 },
  endBtnText: { color: "#c62828", fontWeight: "600" },
  placeholder: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
  },
  muted: { color: "#666", fontSize: 13 },
  error: { color: "#c62828", fontSize: 13, marginTop: 4 },
});
