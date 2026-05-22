import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";

export default function Schedule() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Schedules</Text>
      <Text style={styles.muted}>
        Book a one-off appointment, or set up a recurring weekly slot.
      </Text>

      <Link href="/schedule/new" asChild>
        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>+ Add Schedule</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: "700" },
  muted: { color: "#555" },
  cta: {
    marginTop: 8,
    backgroundColor: "#208AEF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
