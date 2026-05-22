import { useMemo, useState } from "react";
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
import { DateTimeField } from "@/components/datetime-field";
import { ClientPickerModal } from "@/features/schedules/client-picker-modal";
import { createOneOffAppointment } from "@/features/schedules/create-one-off";
import type { Client } from "@/types/firestore";

const DURATIONS = [30, 45, 60, 90] as const;

function defaultDateTime(): Date {
  const d = new Date();
  d.setHours(7, 0, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

export default function NewSchedule() {
  const role = useAuth((s) => s.user?.role);
  const { clientId: paramId } = useLocalSearchParams<{ clientId?: string }>();

  const [pickedClient, setPickedClient] = useState<Client | null>(null);
  const [picking, setPicking] = useState(false);
  const [dateTime, setDateTime] = useState<Date>(defaultDateTime);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetClient = useClient(paramId);
  const client = paramId ? presetClient : pickedClient;
  const clientLoading = Boolean(paramId) && !presetClient;

  const canSave = useMemo(() => {
    return Boolean(client) && dateTime.getTime() > Date.now() && !submitting;
  }, [client, dateTime, submitting]);

  if (role !== "trainer") return <Redirect href="/" />;

  const onSave = async () => {
    if (!client) return;
    setSubmitting(true);
    setError(null);
    try {
      await createOneOffAppointment({
        clientId: client.id,
        dateTime,
        durationMinutes,
      });
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
        <View style={[styles.segmentBtn, styles.segmentDisabled]}>
          <Text style={styles.segmentDisabledText}>Recurring (soon)</Text>
        </View>
        <View style={[styles.segmentBtn, styles.segmentActive]}>
          <Text style={styles.segmentActiveText}>One-off</Text>
        </View>
      </View>

      <Text style={styles.label}>When</Text>
      <DateTimeField value={dateTime} minimumDate={new Date()} onChange={setDateTime} />

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
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {d} min
              </Text>
            </Pressable>
          );
        })}
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  back: { paddingVertical: 4 },
  backText: { color: "#208AEF", fontSize: 15, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  label: { fontSize: 12, color: "#666", textTransform: "uppercase", marginTop: 8 },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
    gap: 12,
  },
  clientName: { fontSize: 16, fontWeight: "600" },
  clientEmail: { fontSize: 13, color: "#666", marginTop: 2 },
  changeText: { color: "#208AEF", fontWeight: "600" },
  pickBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#208AEF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  pickBtnText: { color: "#208AEF", fontWeight: "600" },
  segment: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  segmentActive: { backgroundColor: "#208AEF" },
  segmentActiveText: { color: "#fff", fontWeight: "600" },
  segmentDisabled: { backgroundColor: "#f5f5f5" },
  segmentDisabledText: { color: "#999" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  chipSelected: { backgroundColor: "#208AEF", borderColor: "#208AEF" },
  chipText: { fontSize: 15, fontWeight: "500" },
  chipTextSelected: { color: "#fff" },
  save: {
    backgroundColor: "#208AEF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  saveDisabled: { opacity: 0.5 },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: "#c62828", marginTop: 8 },
});
