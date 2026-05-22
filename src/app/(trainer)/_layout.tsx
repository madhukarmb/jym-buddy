import { Link, Redirect, Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";

function SettingsHeaderButton() {
  return (
    <Link href="/settings" asChild>
      <Pressable hitSlop={12} style={{ paddingHorizontal: 8 }}>
        <Text style={{ color: colors.text, fontSize: 20 }}>⚙</Text>
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
          headerRight: () => <SettingsHeaderButton />,
        }}
      />
      <Stack.Screen name="clients" options={{ title: "Clients" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}
