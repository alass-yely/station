import { apiRequest } from "@/lib/api/client";
import { StartWorkSessionRequest, WorkSessionSummary } from "@/types/work-session";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

const mapWorkSession = (payload: unknown): WorkSessionSummary | null => {
  const source = asRecord(payload);
  const id = asString(source.id || source.sessionId || source.session_id);
  if (!id) return null;
  const pump = asRecord(source.pump);
  const station = asRecord(source.station);
  const cashier = asRecord(source.cashier);

  return {
    id,
    status: asString(source.status) || undefined,
    pumpId: asString(source.pumpId || source.pump_id || pump.id) || undefined,
    stationId: asString(source.stationId || source.station_id || station.id) || undefined,
    pumpLabel:
      asString(source.pumpLabel || source.pumpName || source.pump_label || source.pump_name || pump.label || pump.name) ||
      undefined,
    pumpCode: asString(source.pumpCode || source.pump_code || pump.pumpCode || pump.pump_code || pump.code) || undefined,
    fuelType: asString(source.fuelType || source.fuel_type || pump.fuelType || pump.fuel_type) || undefined,
    stationName: asString(source.stationName || source.station_name || station.name) || undefined,
    cashierFirstName: asString(source.cashierFirstName || source.cashier_first_name || cashier.firstName) || undefined
  };
};

const parseWorkSessionResponse = (payload: unknown): WorkSessionSummary | null => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const candidate =
    data.workSession ||
    data.work_session ||
    root.workSession ||
    root.work_session ||
    data.session ||
    root.session ||
    data.workSessionSummary ||
    root.workSessionSummary ||
    data.work_session_summary ||
    root.work_session_summary ||
    data.currentWorkSession ||
    data.current_work_session ||
    root.currentWorkSession ||
    root.current_work_session ||
    data.result ||
    root.result ||
    data;

  return mapWorkSession(candidate || root);
};

export const getCurrentWorkSession = async (
  accessToken: string
): Promise<WorkSessionSummary | null> => {
  const response = await apiRequest<unknown>("/stations/me/work-sessions/current", {
    method: "GET",
    token: accessToken
  });

  return parseWorkSessionResponse(response);
};

export const startWorkSession = async (
  payload: StartWorkSessionRequest,
  accessToken: string
): Promise<WorkSessionSummary | null> => {
  const response = await apiRequest<unknown>("/stations/me/work-sessions/start", {
    method: "POST",
    token: accessToken,
    body: payload
  });

  return parseWorkSessionResponse(response);
};

export const closeWorkSession = async (
  sessionId: string,
  accessToken: string
): Promise<void> => {
  await apiRequest<unknown>(`/stations/me/work-sessions/${sessionId}/close`, {
    method: "POST",
    token: accessToken
  });
};
