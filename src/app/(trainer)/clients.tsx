import { StyleSheet, Text, View } from "react-native";

export default function Clients() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Clients</Text>
      <Text style={styles.muted}>
        Enrolled clients list + Enrol Client action. See
        docs/modules/trainer/clients.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: "700" },
  muted: { color: "#555" },
});
