import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DateTimeField } from "@/components/datetime-field";
import type { ScheduleSlot, Weekday } from "@/types/firestore";
import { colors } from "@/lib/theme";

type Props = {
  visible: boolean;
  initial?: ScheduleSlot | null;
  onClose: () => void;
  onSave: (slot: ScheduleSlot) => void;
};

const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};
const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
const DURATIONS = [30, 45, 60, 90] as const;

function defaultTime(): Date {
  const d = new Date();
  d.setHours(7, 0, 0, 0);
  return d;
}

export function SlotEditorModal({ visible, initial, onClose, onSave }: Props) {
  const [weekday, setWeekday] = useState<Weekday>(initial?.weekday ?? 1);
  const [time, setTime] = useState<Date>(() => {
    if (initial) {
      const d = new Date();
      d.setHours(initial.startHour, initial.startMinute, 0, 0);
      return d;
    }
    return defaultTime();
  });
  const [durationMinutes, setDurationMinutes] = useState<number>(
    initial?.durationMinutes ?? 60,
  );

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setWeekday(initial.weekday);
      const d = new Date();
      d.setHours(initial.startHour, initial.startMinute, 0, 0);
      setTime(d);
      setDurationMinutes(initial.durationMinutes);
    } else {
      setWeekday(1);
      setTime(defaultTime());
      setDurationMinutes(60);
    }
  }, [visible, initial]);

  const handleSave = () => {
    onSave({
      weekday,
      startHour: time.getHours(),
      startMinute: time.getMinutes(),
      durationMinutes,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{initial ? "Edit Slot" : "Add Slot"}</Text>

          <Text style={styles.label}>Weekday</Text>
          <View style={styles.chips}>
            {WEEKDAYS.map((w) => {
              const selected = w === weekday;
              return (
                <Pressable
                  key={w}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setWeekday(w)}
                >
                  <Text
                    style={[styles.chipText, selected && styles.chipTextSelected]}
                  >
                    {WEEKDAY_LABELS[w]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Start time</Text>
          <DateTimeField value={time} onChange={setTime} />

          <Text style={styles.label}>Duration</Text>
          <View style={styles.chips}>
            {DURATIONS.map((d) => {
              const selected = d === durationMinutes;
              return (
                <Pressable
                  key={d}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setDurationMinutes(d)}
                >
                  <Text
                    style={[styles.chipText, selected && styles.chipTextSelected]}
                  >
                    {d} min
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleSave}
            >
              <Text style={styles.btnPrimaryText}>{initial ? "Save" : "Add"}</Text>
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
  title: { fontSize: 18, fontWeight: "800", marginBottom: 4, color: colors.text },
  label: {
    fontSize: 11,
    color: colors.textDim,
    textTransform: "uppercase",
    marginTop: 8,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.bg,
  },
  chipSelected: { backgroundColor: colors.mint, borderColor: colors.mint },
  chipText: { fontSize: 14, fontWeight: "600", color: colors.text },
  chipTextSelected: { color: colors.bg, fontWeight: "800" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 16 },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 96,
  },
  btnGhost: { backgroundColor: "transparent" },
  btnGhostText: { color: colors.textMuted, fontWeight: "700" },
  btnPrimary: { backgroundColor: colors.mint },
  btnPrimaryText: { color: colors.bg, fontWeight: "800" },
});
