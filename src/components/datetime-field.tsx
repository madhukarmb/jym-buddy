import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  value: Date;
  minimumDate?: Date;
  onChange: (next: Date) => void;
};

const dateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export function DateTimeField({ value, minimumDate, onChange }: Props) {
  if (Platform.OS === "android") {
    const open = (mode: "date" | "time") =>
      DateTimePickerAndroid.open({
        value,
        minimumDate,
        mode,
        is24Hour: false,
        onChange: (_event, next) => {
          if (next) onChange(next);
        },
      });

    return (
      <View style={styles.row}>
        <Pressable style={styles.chip} onPress={() => open("date")}>
          <Text style={styles.chipText}>{dateFmt.format(value)}</Text>
        </Pressable>
        <Pressable style={styles.chip} onPress={() => open("time")}>
          <Text style={styles.chipText}>{timeFmt.format(value)}</Text>
        </Pressable>
      </View>
    );
  }

  // iOS — inline picker.
  return (
    <DateTimePicker
      value={value}
      mode="datetime"
      minimumDate={minimumDate}
      onChange={(_event, next) => {
        if (next) onChange(next);
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  chipText: { fontSize: 15, fontWeight: "500" },
});
