export interface ResolvedDriver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  qrCodeToken?: string;
  referralCode?: string;
  status?: string;
}

export interface DriverResolutionResponse {
  driver: ResolvedDriver;
}
