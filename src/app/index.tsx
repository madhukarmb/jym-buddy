import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth";

export default function Index() {
  const status = useAuth((s) => s.status);
  const role = useAuth((s) => s.user?.role);

  if (status === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  if (status === "signedOut") return <Redirect href="/login" />;
  if (role === "trainer") return <Redirect href="/(trainer)" />;
  if (role === "client") return <Redirect href="/(client)" />;
  return null;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
