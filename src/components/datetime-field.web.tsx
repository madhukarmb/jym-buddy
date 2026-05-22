type Props = {
  value: Date;
  minimumDate?: Date;
  onChange: (next: Date) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

function toLocalISO(d: Date): string {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function DateTimeField({ value, minimumDate, onChange }: Props) {
  return (
    <input
      type="datetime-local"
      value={toLocalISO(value)}
      min={minimumDate ? toLocalISO(minimumDate) : undefined}
      onChange={(e) => {
        const v = e.target.value;
        if (v) onChange(new Date(v));
      }}
      style={{
        padding: 10,
        fontSize: 16,
        border: "1px solid #ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
      }}
    />
  );
}
