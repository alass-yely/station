import { WorkSessionSummary } from "@/types/work-session";

export type UserRole =
  | "CASHIER"
  | "STATION_MANAGER"
  | "STATION_OWNER"
  | "YELY_ADMIN"
  | Lowercase<"CASHIER" | "STATION_MANAGER" | "STATION_OWNER" | "YELY_ADMIN">
  | string;

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | Lowercase<"ACTIVE" | "INACTIVE" | "SUSPENDED">
  | string;

export interface StationSummary {
  id: string;
  name?: string;
  stationCode?: string;
}

export interface StationStaffUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  stationId?: string;
  organizationId?: string;
}

export interface StationSession {
  accessToken: string;
  refreshToken: string;
  user: StationStaffUser;
  station?: StationSummary;
  mustSelectPump: boolean;
  currentWorkSession?: WorkSessionSummary | null;
}

export interface LoginRequest {
  stationCode: string;
  phone: string;
  pin: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: StationStaffUser;
  station?: StationSummary;
  mustSelectPump: boolean;
}
