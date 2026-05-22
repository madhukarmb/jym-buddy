import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ClientPickerModal } from "@/features/schedules/client-picker-modal";

export default function Sessions() {
  const [picking, setPicking] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Client Sessions</Text>
      <Text style={styles.muted}>
        View outstanding sessions per client and close out billing.
      </Text>

      <Pressable style={styles.cta} onPress={() => setPicking(true)}>
        <Text style={styles.ctaText}>Pick a client</Text>
      </Pressable>

      <ClientPickerModal
        visible={picking}
        onClose={() => setPicking(false)}
        onSelect={(c) => router.push(`/sessions/${c.id}`)}
      />
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
