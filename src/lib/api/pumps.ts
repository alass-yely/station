import { apiRequest } from "@/lib/api/client";
import { StationPump } from "@/types/pump";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const mapPump = (payload: unknown): StationPump => {
  const raw = asRecord(payload);

  return {
    id: asString(raw.id),
    label: asString(raw.label || raw.name) || undefined,
    pumpCode: asString(raw.pumpCode || raw.code) || undefined,
    fuelType: asString(raw.fuelType) || undefined,
    isActive: asBoolean(raw.isActive),
    status: asString(raw.status) || undefined
  };
};

const parsePumpsResponse = (payload: unknown): StationPump[] => {
  const root = asRecord(payload);
  const data = asRecord(root.data);

  const rawItems =
    (Array.isArray(data.items) && data.items) ||
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(data.pumps) && data.pumps) ||
    (Array.isArray(root.pumps) && root.pumps) ||
    (Array.isArray(data) ? data : undefined) ||
    (Array.isArray(payload) ? payload : []);

  return rawItems
    .map(mapPump)
    .filter((pump) => pump.id)
    .filter((pump) => {
      if (pump.isActive === true) return true;
      if (pump.isActive === false) return false;

      const status = String(pump.status || "").toUpperCase();
      return !status || status === "ACTIVE";
    });
};

export const getStationPumps = async (
  stationId: string,
  accessToken: string
): Promise<StationPump[]> => {
  const response = await apiRequest<unknown>(`/stations/me/${stationId}/pumps`, {
    method: "GET",
    token: accessToken
  });

  return parsePumpsResponse(response);
};
