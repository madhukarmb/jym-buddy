import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  cancelAppointment,
  checkIn,
  markNoShow,
} from "@/features/appointments/actions";
import { RescheduleModal } from "@/features/appointments/reschedule-modal";
import { useClient } from "@/features/clients/use-client";
import type { Appointment, AppointmentStatus } from "@/types/firestore";
import { colors } from "@/lib/theme";

const timeFmt = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
});

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  checked_in: "Checked-in",
  no_show: "No-show",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
};

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  scheduled: colors.textMuted,
  checked_in: colors.mint,
  no_show: colors.danger,
  cancelled: colors.textDim,
  rescheduled: colors.textDim,
};

function confirmCancel(onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm("Cancel this appointment?")) {
      onConfirm();
    }
    return;
  }
  Alert.alert(
    "Cancel this appointment?",
    "The parent recurring schedule is not affected.",
    [
      { text: "Keep", style: "cancel" },
      { text: "Cancel appointment", style: "destructive", onPress: onConfirm },
    ],
  );
}

export function TodayAppointmentRow({ appointment }: { appointment: Appointment }) {
  const client = useClient(appointment.clientId);
  const time = timeFmt.format(appointment.dateTime.toDate());
  const clientName = client?.name ?? "…";
  const isCancelled = appointment.status === "cancelled";
  const [showReschedule, setShowReschedule] = useState(false);

  const onCheckIn = () => checkIn(appointment.id);
  const onNoShow = () => markNoShow(appointment.id);
  const onCancel = () =>
    confirmCancel(() => {
      cancelAppointment(appointment.id);
    });
  const onReschedule = () => setShowReschedule(true);

  return (
    <View style={[styles.row, isCancelled && styles.rowCancelled]}>
      <View style={styles.head}>
        <Text style={[styles.time, isCancelled && styles.struck]}>{time}</Text>
        <Text style={[styles.name, isCancelled && styles.struck]}>{clientName}</Text>
        <Text style={[styles.status, { color: STATUS_COLOR[appointment.status] }]}>
          {STATUS_LABEL[appointment.status]}
        </Text>
      </View>
      {isCancelled ? null : (
        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, appointment.status === "checked_in" && styles.btnActiveGreen]}
            onPress={onCheckIn}
          >
            <Text style={[styles.btnText, appointment.status === "checked_in" && styles.btnTextActive]}>
              Check-in
            </Text>
          </Pressable>
          <Pressable
            style={[styles.btn, appointment.status === "no_show" && styles.btnActiveRed]}
            onPress={onNoShow}
          >
            <Text style={[styles.btnText, appointment.status === "no_show" && styles.btnTextActive]}>
              No Show
            </Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={onReschedule}>
            <Text style={styles.btnText}>Reschedule</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={onCancel}>
            <Text style={[styles.btnText, styles.btnDanger]}>Cancel</Text>
          </Pressable>
        </View>
      )}
      <RescheduleModal
        appointment={appointment}
        visible={showReschedule}
        onClose={() => setShowReschedule(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    backgroundColor: colors.surface,
  },
  rowCancelled: { opacity: 0.55 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  time: { fontSize: 16, fontWeight: "700", width: 72, color: colors.text },
  name: { fontSize: 16, flex: 1, color: colors.text },
  struck: { textDecorationLine: "line-through", color: colors.textDim },
  status: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  btnText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  btnActiveGreen: { backgroundColor: colors.mint, borderColor: colors.mint },
  btnActiveRed: { backgroundColor: colors.danger, borderColor: colors.danger },
  btnTextActive: { color: colors.bg },
  btnDanger: { color: colors.danger },
});
