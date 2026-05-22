import type { ScheduleSlot } from "@/types/firestore";

export const MATERIALISATION_WINDOW_DAYS = 60;

export type AppointmentDraft = {
  dateTime: Date;
  durationMinutes: number;
};

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function materialiseSchedule(args: {
  slots: ScheduleSlot[];
  startDate: Date;
  endDate: Date | null;
  windowDays?: number;
}): AppointmentDraft[] {
  const { slots, startDate, endDate } = args;
  const windowDays = args.windowDays ?? MATERIALISATION_WINDOW_DAYS;

  const from = startOfDay(startDate);
  const windowEnd = new Date(from);
  windowEnd.setDate(windowEnd.getDate() + windowDays);

  const cap = endDate ? (endDate < windowEnd ? endDate : windowEnd) : windowEnd;

  const drafts: AppointmentDraft[] = [];
  const cursor = new Date(from);
  while (cursor < cap) {
    for (const slot of slots) {
      if (cursor.getDay() === slot.weekday) {
        const dt = new Date(cursor);
        dt.setHours(slot.startHour, slot.startMinute, 0, 0);
        if (dt.getTime() >= Date.now()) {
          drafts.push({ dateTime: dt, durationMinutes: slot.durationMinutes });
        }
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return drafts;
}
