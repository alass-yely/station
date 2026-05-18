import { apiRequest } from "@/lib/api/client";
import { LoginRequest, LoginResponse, StationStaffUser, StationSummary } from "@/types/auth";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

const mapStation = (rawStation: unknown): StationSummary | undefined => {
  const station = asRecord(rawStation);
  const id = asString(station.id);
  if (!id) return undefined;

  return {
    id,
    name: asString(station.name) || undefined,
    stationCode: asString(station.stationCode || station.code) || undefined
  };
};

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
  const station = mapStation(root.station || data.station);
  const mustSelectPumpRaw = root.mustSelectPump ?? data.mustSelectPump;

  return {
    accessToken,
    refreshToken,
    user,
    station,
    mustSelectPump: typeof mustSelectPumpRaw === "boolean" ? mustSelectPumpRaw : false
  };
};

const parseMePayload = (payload: unknown): StationStaffUser => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  return mapUser(root.user || data.user || data);
};

export const loginStationStaff = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response = await apiRequest<unknown>("/auth/station/cashier/login", {
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
