import { StyleSheet, Text, View } from "react-native";

export default function Schedule() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Add Schedule</Text>
      <Text style={styles.muted}>
        Recurring + one-off scheduling. See docs/modules/trainer/schedule.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: "700" },
  muted: { color: "#555" },
});
