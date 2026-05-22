import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/lib/auth";
import { colors, gradients } from "@/lib/theme";

export default function Login() {
  const signIn = useAuth((s) => s.signIn);
  const status = useAuth((s) => s.status);
  const error = useAuth((s) => s.error);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "signedIn") return <Redirect href="/" />;

  const onSubmit = async () => {
    if (!email || !password || submitting) return;
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch {
      // Error is surfaced via the store; the gate stays on login.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Gym Buddy</Text>
      <Text style={styles.subtitle}>Find your strength</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textDim}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!submitting}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textDim}
        secureTextEntry
        autoComplete="current-password"
        value={password}
        onChangeText={setPassword}
        editable={!submitting}
        onSubmitEditing={onSubmit}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.btnWrap, submitting && styles.btnDisabled]}
        onPress={onSubmit}
        disabled={submitting}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btn}
        >
          {submitting ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.btnText}>Sign in</Text>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 12,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.mint,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  error: { color: colors.danger, fontSize: 14, textAlign: "center" },
  btnWrap: {
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },
  btn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.bg, fontWeight: "800", fontSize: 16, letterSpacing: 0.3 },
});
