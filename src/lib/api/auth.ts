import { apiRequest } from "@/lib/api/client";
import { LoginRequest, LoginResponse, StationStaffUser } from "@/types/auth";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

const mapUser = (rawUser: unknown): StationStaffUser => {
  const user = asRecord(rawUser);
  const station = asRecord(user.station);
  const organization = asRecord(user.organization);

  return {
    id: asString(user.id),
    firstName: asString(user.firstName || user.firstname || user.givenName),
    lastName: asString(user.lastName || user.lastname || user.familyName),
    phone: asString(user.phone || user.phoneNumber),
    role: asString(user.role),
    status: asString(user.status || "ACTIVE"),
    stationId: asString(user.stationId || station.id) || undefined,
    organizationId: asString(user.organizationId || organization.id) || undefined
  };
};

const parseLoginPayload = (payload: unknown): LoginResponse => {
  const root = asRecord(payload);
  const data = asRecord(root.data);

  const accessToken =
    asString(root.accessToken) ||
    asString(root.token) ||
    asString(data.accessToken) ||
    asString(data.token);
  const refreshToken =
    asString(root.refreshToken) || asString(data.refreshToken) || asString(data.refresh_token);
  const user = mapUser(root.user || data.user);

  return { accessToken, refreshToken, user };
};

const parseMePayload = (payload: unknown): StationStaffUser => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  return mapUser(root.user || data.user || data);
};

export const loginStationStaff = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response = await apiRequest<unknown>("/auth/login", {
    method: "POST",
    body: payload
  });

  return parseLoginPayload(response);
};

export const getMe = async (accessToken: string): Promise<StationStaffUser> => {
  const response = await apiRequest<unknown>("/auth/me", {
    method: "GET",
    token: accessToken
  });

  return parseMePayload(response);
};
