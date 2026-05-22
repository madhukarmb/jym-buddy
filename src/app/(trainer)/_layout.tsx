import { Link, Redirect, Stack } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";

function ProfileHeaderButton() {
  const user = useAuth((s) => s.user);
  const source = user?.displayName?.trim() || user?.email || "?";
  const initial = source.charAt(0).toUpperCase() || "?";

  return (
    <Link href="/settings" asChild>
      <Pressable hitSlop={12} style={styles.btn} accessibilityLabel="Open profile menu">
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function TrainerLayout() {
  const role = useAuth((s) => s.user?.role);
  if (role !== "trainer") return <Redirect href="/" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: "700" },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerRight: () => <ProfileHeaderButton />,
        }}
      />
      <Stack.Screen name="clients" options={{ title: "Clients" }} />
      <Stack.Screen name="settings" options={{ title: "Profile" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 4 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.bg, fontWeight: "800", fontSize: 14 },
});
