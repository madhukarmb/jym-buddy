import type { Timestamp } from "firebase/firestore";

export type AppointmentStatus =
  | "scheduled"
  | "checked_in"
  | "no_show"
  | "cancelled"
  | "rescheduled";

export type BillingStatus = "outstanding" | "billed";

export interface Client {
  id: string;
  name: string;
  email: string;
  profilePicturePath?: string;
  createdAt: Timestamp;
}

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ScheduleSlot {
  weekday: Weekday;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
}

export interface Schedule {
  id: string;
  clientId: string;
  trainerId: string;
  slots: ScheduleSlot[];
  startDate: Timestamp;
  endDate: Timestamp | null;
  createdAt: Timestamp;
}

export interface Appointment {
  id: string;
  clientId: string;
  trainerId: string;
  scheduleId: string | null;
  dateTime: Timestamp;
  durationMinutes: number;
  status: AppointmentStatus;
  billingStatus: BillingStatus;
  billingClosureId?: string;
  createdAt: Timestamp;
}
