import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useClient } from "@/features/clients/use-client";
import { DateTimeField } from "@/components/datetime-field";
import { ClientPickerModal } from "@/features/schedules/client-picker-modal";
import { createOneOffAppointment } from "@/features/schedules/create-one-off";
import { createRecurringSchedule } from "@/features/schedules/create-recurring";
import { SlotEditorModal } from "@/features/schedules/slot-editor-modal";
import type { Client, ScheduleSlot, Weekday } from "@/types/firestore";
import { colors } from "@/lib/theme";

type Mode = "recurring" | "oneoff";

const DURATIONS = [30, 45, 60, 90] as const;
const WEEKDAY_NAMES: Record<Weekday, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};
const WEEKDAY_ORDER: Record<Weekday, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  0: 6,
};

function defaultDateTime(): Date {
  const d = new Date();
  d.setHours(7, 0, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatSlot(slot: ScheduleSlot): string {
  const h12 = ((slot.startHour + 11) % 12) + 1;
  const ampm = slot.startHour >= 12 ? "PM" : "AM";
  const mm = slot.startMinute.toString().padStart(2, "0");
  return `${WEEKDAY_NAMES[slot.weekday]} · ${h12}:${mm} ${ampm} · ${slot.durationMinutes} min`;
}

function sortSlots(slots: ScheduleSlot[]): ScheduleSlot[] {
  return [...slots].sort((a, b) => {
    if (a.weekday !== b.weekday)
      return WEEKDAY_ORDER[a.weekday] - WEEKDAY_ORDER[b.weekday];
    if (a.startHour !== b.startHour) return a.startHour - b.startHour;
    return a.startMinute - b.startMinute;
  });
}

const dateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function NewSchedule() {
  const role = useAuth((s) => s.user?.role);
  const { clientId: paramId } = useLocalSearchParams<{ clientId?: string }>();

  const [pickedClient, setPickedClient] = useState<Client | null>(null);
  const [picking, setPicking] = useState(false);
  const [mode, setMode] = useState<Mode>("recurring");

  // One-off state
  const [dateTime, setDateTime] = useState<Date>(defaultDateTime);
  const [oneOffDuration, setOneOffDuration] = useState<number>(60);

  // Recurring state
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [slotOpen, setSlotOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(startOfToday);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = startOfToday();
    d.setDate(d.getDate() + 28);
    return d;
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetClient = useClient(paramId);
  const client = paramId ? presetClient : pickedClient;
  const clientLoading = Boolean(paramId) && !presetClient;

  const canSave = useMemo(() => {
    if (!client || submitting) return false;
    if (mode === "oneoff") return true; // past dates allowed for back-fill
    if (slots.length === 0) return false;
    if (hasEndDate && endDate.getTime() < startDate.getTime()) return false;
    return true;
  }, [client, submitting, mode, slots, hasEndDate, endDate, startDate]);

  if (role !== "trainer") return <Redirect href="/" />;

  const openAddSlot = () => {
    setEditingSlot(null);
    setEditingIndex(null);
    setSlotOpen(true);
  };

  const openEditSlot = (index: number) => {
    setEditingSlot(slots[index]);
    setEditingIndex(index);
    setSlotOpen(true);
  };

  const handleSlotSave = (slot: ScheduleSlot) => {
    if (editingIndex !== null) {
      const next = [...slots];
      next[editingIndex] = slot;
      setSlots(sortSlots(next));
    } else {
      setSlots(sortSlots([...slots, slot]));
    }
  };

  const handleSlotRemove = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const onSave = async () => {
    if (!client) return;
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "oneoff") {
        await createOneOffAppointment({
          clientId: client.id,
          dateTime,
          durationMinutes: oneOffDuration,
        });
      } else {
        await createRecurringSchedule({
          clientId: client.id,
          slots,
          startDate,
          endDate: hasEndDate ? endDate : null,
        });
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>
      <Text style={styles.title}>Add Schedule</Text>

      <Text style={styles.label}>Client</Text>
      {clientLoading ? (
        <View style={styles.clientCard}>
          <ActivityIndicator />
        </View>
      ) : client ? (
        <View style={styles.clientCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientEmail}>{client.email}</Text>
          </View>
          {!paramId ? (
            <Pressable onPress={() => setPicking(true)}>
              <Text style={styles.changeText}>Change</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <Pressable style={styles.pickBtn} onPress={() => setPicking(true)}>
          <Text style={styles.pickBtnText}>Choose Client</Text>
        </Pressable>
      )}

      <Text style={styles.label}>Type</Text>
      <View style={styles.segment}>
        <Pressable
          style={[styles.segmentBtn, mode === "recurring" && styles.segmentActive]}
          onPress={() => setMode("recurring")}
        >
          <Text
            style={mode === "recurring" ? styles.segmentActiveText : styles.segmentText}
          >
            Recurring
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segmentBtn, mode === "oneoff" && styles.segmentActive]}
          onPress={() => setMode("oneoff")}
        >
          <Text
            style={mode === "oneoff" ? styles.segmentActiveText : styles.segmentText}
          >
            One-off
          </Text>
        </Pressable>
      </View>

      {mode === "oneoff" ? (
        <>
          <Text style={styles.label}>When</Text>
          <DateTimeField value={dateTime} onChange={setDateTime} />
          <Text style={styles.hint}>
            Past dates allowed — back-fill a session that already happened.
          </Text>

          <Text style={styles.label}>Duration</Text>
          <View style={styles.chips}>
            {DURATIONS.map((d) => {
              const selected = d === oneOffDuration;
              return (
                <Pressable
                  key={d}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setOneOffDuration(d)}
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
        </>
      ) : (
        <>
          <Text style={styles.label}>Slots</Text>
          {slots.length === 0 ? (
            <Text style={styles.muted}>
              Add at least one slot to define the weekly pattern.
            </Text>
          ) : (
            <View style={styles.slotList}>
              {slots.map((s, i) => (
                <View key={i} style={styles.slotRow}>
                  <Pressable style={{ flex: 1 }} onPress={() => openEditSlot(i)}>
                    <Text style={styles.slotText}>{formatSlot(s)}</Text>
                  </Pressable>
                  <Pressable onPress={() => handleSlotRemove(i)} hitSlop={8}>
                    <Text style={styles.slotRemove}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          <Pressable style={styles.addSlot} onPress={openAddSlot}>
            <Text style={styles.addSlotText}>+ Add slot</Text>
          </Pressable>

          <Text style={styles.label}>Start date</Text>
          <DateTimeField
            value={startDate}
            minimumDate={startOfToday()}
            onChange={(d) => {
              const at0 = new Date(d);
              at0.setHours(0, 0, 0, 0);
              setStartDate(at0);
            }}
          />

          <View style={styles.endRow}>
            <Text style={styles.label}>End date</Text>
            <Switch value={hasEndDate} onValueChange={setHasEndDate} />
          </View>
          {hasEndDate ? (
            <DateTimeField
              value={endDate}
              minimumDate={startDate}
              onChange={(d) => {
                const at0 = new Date(d);
                at0.setHours(0, 0, 0, 0);
                setEndDate(at0);
              }}
            />
          ) : (
            <Text style={styles.muted}>Indefinite — runs until ended manually.</Text>
          )}

          <Text style={styles.hint}>
            Saving creates the schedule and books the next 60 days of appointments.
            {hasEndDate ? ` Ends ${dateFmt.format(endDate)}.` : ""}
          </Text>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.save, !canSave && styles.saveDisabled]}
        disabled={!canSave}
        onPress={onSave}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save</Text>
        )}
      </Pressable>

      <ClientPickerModal
        visible={picking}
        onClose={() => setPicking(false)}
        onSelect={setPickedClient}
      />
      <SlotEditorModal
        visible={slotOpen}
        initial={editingSlot}
        onClose={() => setSlotOpen(false)}
        onSave={handleSlotSave}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32, backgroundColor: colors.bg, flexGrow: 1 },
  back: { paddingVertical: 4 },
  backText: { color: colors.mint, fontSize: 15, fontWeight: "700" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 8, color: colors.text, letterSpacing: -0.3 },
  label: {
    fontSize: 11,
    color: colors.textDim,
    textTransform: "uppercase",
    marginTop: 8,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  muted: { color: colors.textMuted, fontSize: 13 },
  hint: { color: colors.textDim, fontSize: 12, marginTop: 4, fontStyle: "italic" },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: 12,
  },
  clientName: { fontSize: 16, fontWeight: "700", color: colors.text },
  clientEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  changeText: { color: colors.mint, fontWeight: "700" },
  pickBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.mint,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  pickBtnText: { color: colors.mint, fontWeight: "700" },
  segment: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  segmentActive: { backgroundColor: colors.mint },
  segmentText: { color: colors.textMuted, fontWeight: "700" },
  segmentActiveText: { color: colors.bg, fontWeight: "800" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.mint, borderColor: colors.mint },
  chipText: { fontSize: 14, fontWeight: "600", color: colors.text },
  chipTextSelected: { color: colors.bg, fontWeight: "800" },
  slotList: { gap: 8 },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  slotText: { fontSize: 15, fontWeight: "600", color: colors.text },
  slotRemove: { color: colors.danger, fontSize: 22, fontWeight: "700", paddingHorizontal: 4 },
  addSlot: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.mint,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  addSlotText: { color: colors.mint, fontWeight: "700" },
  endRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  save: {
    backgroundColor: colors.mint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  saveDisabled: { opacity: 0.4 },
  saveText: { color: colors.bg, fontWeight: "800", fontSize: 16 },
  error: { color: colors.danger, marginTop: 8 },
});
