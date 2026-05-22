import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/lib/auth";
import { useTodayAppointments } from "@/features/appointments/use-today-appointments";
import { TodayAppointmentRow } from "@/features/appointments/today-appointment-row";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function TrainerHome() {
  const user = useAuth((s) => s.user);
  const { appointments, loading, error } = useTodayAppointments(user?.uid);

  const firstName = (user?.displayName ?? "").split(" ")[0] || "Trainer";
  const today = dateFmt.format(new Date());

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.greeting}>Hi, {firstName}</Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      <Text style={styles.sectionTitle}>Today&rsquo;s Appointments</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Couldn&rsquo;t load appointments</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>No appointments today.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {appointments.map((a) => (
            <TodayAppointmentRow key={a.id} appointment={a} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  greeting: { fontSize: 22, fontWeight: "700" },
  date: { fontSize: 14, color: "#666", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  list: { gap: 10 },
  empty: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  muted: { color: "#666" },
  center: { padding: 16, alignItems: "center" },
  errorCard: {
    borderWidth: 1,
    borderColor: "#ffcdd2",
    backgroundColor: "#ffebee",
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  errorTitle: { fontWeight: "600", color: "#c62828" },
  errorText: { color: "#c62828", fontSize: 12 },
});
