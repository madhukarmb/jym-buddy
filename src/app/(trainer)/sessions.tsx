import { StyleSheet, Text, View } from "react-native";

export default function Sessions() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Client Sessions</Text>
      <Text style={styles.muted}>
        Per-client billing ledger + Close Billing. See
        docs/modules/trainer/client_sessions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: "700" },
  muted: { color: "#555" },
});
