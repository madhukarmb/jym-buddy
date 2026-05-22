import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { enrolClient } from "@/features/clients/enrol-client";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EnrolClientModal({ visible, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameOk = name.trim().length > 0 && name.trim().length <= 80;
  const emailOk = EMAIL_RE.test(email.trim());
  const passwordOk = password.length >= 6;
  const canSave = nameOk && emailOk && passwordOk && !submitting;

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const onSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    setError(null);
    try {
      await enrolClient({ name, email, password });
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enrol failed");
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Enrol Client</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            maxLength={80}
            editable={!submitting}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="client@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!submitting}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!submitting}
          />
          <Text style={styles.hint}>
            Share this password with the client manually — they&rsquo;ll use it to sign in.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, styles.btnGhost]}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={styles.btnGhostText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary, !canSave && styles.btnDisabled]}
              onPress={onSave}
              disabled={!canSave}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>Save</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    gap: 8,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 10px 30px rgba(0,0,0,0.2)" as unknown as never }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 16,
          elevation: 6,
        }),
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  label: { fontSize: 12, color: "#666", textTransform: "uppercase", marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  hint: { fontSize: 12, color: "#888", marginTop: 2 },
  error: { color: "#c62828", fontSize: 13, marginTop: 8 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 12 },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 96,
  },
  btnGhost: { backgroundColor: "transparent" },
  btnGhostText: { color: "#444", fontWeight: "600" },
  btnPrimary: { backgroundColor: "#208AEF" },
  btnPrimaryText: { color: "#fff", fontWeight: "600" },
  btnDisabled: { opacity: 0.5 },
});
