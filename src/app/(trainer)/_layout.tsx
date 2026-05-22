import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/lib/auth";

export default function TrainerLayout() {
  const role = useAuth((s) => s.user?.role);
  if (role !== "trainer") return <Redirect href="/" />;

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="clients" options={{ title: "Clients" }} />
      <Tabs.Screen name="schedule" options={{ title: "Schedule" }} />
      <Tabs.Screen name="sessions" options={{ title: "Sessions" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
