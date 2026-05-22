import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/lib/auth";

export default function ClientLayout() {
  const role = useAuth((s) => s.user?.role);
  if (role !== "client") return <Redirect href="/" />;

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: "Attendance" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
