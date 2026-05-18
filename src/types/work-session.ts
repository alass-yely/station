export interface WorkSessionSummary {
  id: string;
  status?: string;
  pumpId?: string;
  stationId?: string;
  pumpLabel?: string;
  pumpCode?: string;
  fuelType?: string;
  stationName?: string;
  cashierFirstName?: string;
}

export interface StartWorkSessionRequest {
  stationId: string;
  pumpId: string;
}
