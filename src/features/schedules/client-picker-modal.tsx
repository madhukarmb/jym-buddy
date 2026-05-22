import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useClients } from "@/features/clients/use-clients";
import type { Client } from "@/types/firestore";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
};

export function ClientPickerModal({ visible, onClose, onSelect }: Props) {
  const { clients, loading, error } = useClients();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Select Client</Text>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
            </View>
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : clients.length === 0 ? (
            <Text style={styles.muted}>No clients yet. Enrol one first.</Text>
          ) : (
            <ScrollView style={styles.list}>
              {clients.map((c) => (
                <Pressable
                  key={c.id}
                  style={styles.row}
                  onPress={() => {
                    onSelect(c);
                    onClose();
                  }}
                >
                  <Text style={styles.name}>{c.name}</Text>
                  <Text style={styles.email}>{c.email}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
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
    maxHeight: "80%",
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
  list: { maxHeight: 320 },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  name: { fontSize: 16, fontWeight: "600" },
  email: { fontSize: 13, color: "#666", marginTop: 2 },
  center: { padding: 32, alignItems: "center" },
  muted: { color: "#666", padding: 16, textAlign: "center" },
  error: { color: "#c62828", padding: 16 },
  cancel: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  cancelText: { color: "#444", fontWeight: "600" },
});
