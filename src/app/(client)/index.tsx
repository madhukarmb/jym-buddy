import { StyleSheet, Text, View } from "react-native";

export default function ClientHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Validate Attendance</Text>
      <Text style={styles.muted}>
        Confirm your own attendance for a session. See
        docs/modules/client/attendance.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: "700" },
  muted: { color: "#555" },
});
