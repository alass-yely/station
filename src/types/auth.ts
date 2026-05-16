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
}

export interface LoginRequest {
  phone: string;
  pin: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: StationStaffUser;
}
