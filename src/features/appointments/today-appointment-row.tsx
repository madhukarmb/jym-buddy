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
  scheduled: "#888",
  checked_in: "#2e7d32",
  no_show: "#d32f2f",
  cancelled: "#888",
  rescheduled: "#888",
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
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    gap: 10,
    backgroundColor: "#fff",
  },
  rowCancelled: { backgroundColor: "#fafafa", opacity: 0.7 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  time: { fontSize: 16, fontWeight: "600", width: 72 },
  name: { fontSize: 16, flex: 1 },
  struck: { textDecorationLine: "line-through", color: "#888" },
  status: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  btnText: { fontSize: 13, fontWeight: "500" },
  btnActiveGreen: { backgroundColor: "#2e7d32", borderColor: "#2e7d32" },
  btnActiveRed: { backgroundColor: "#d32f2f", borderColor: "#d32f2f" },
  btnTextActive: { color: "#fff" },
  btnDanger: { color: "#d32f2f" },
});
