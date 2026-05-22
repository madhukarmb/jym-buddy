import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/lib/auth";

export default function TrainerSettings() {
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.displayName ?? "—"}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? "—"}</Text>
      </View>
      <Pressable style={styles.btn} onPress={signOut}>
        <Text style={styles.btnText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  h1: { fontSize: 22, fontWeight: "700" },
  card: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 16,
    gap: 4,
  },
  label: { fontSize: 12, color: "#888", marginTop: 6 },
  value: { fontSize: 16 },
  btn: {
    backgroundColor: "#d32f2f",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
