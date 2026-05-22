import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";

function confirmLogout(): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(typeof window !== "undefined" && window.confirm("Log out?"));
  }
  return new Promise((resolve) => {
    Alert.alert("Log out?", undefined, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: "Log out", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

export default function TrainerSettings() {
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const [busy, setBusy] = useState(false);

  const onLogout = async () => {
    const ok = await confirmLogout();
    if (!ok) return;
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.displayName ?? "—"}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? "—"}</Text>
      </View>
      <Pressable style={[styles.btn, busy && styles.btnBusy]} onPress={onLogout} disabled={busy}>
        {busy ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.btnText}>Logout</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: colors.bg, flex: 1 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "700",
  },
  value: { fontSize: 16, color: colors.text },
  btn: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnBusy: { opacity: 0.7 },
  btnText: { color: colors.text, fontWeight: "700", fontSize: 16 },
});
