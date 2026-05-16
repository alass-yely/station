export type UserRole = 'driver' | string;
export type UserStatus = 'active' | 'inactive' | 'blocked' | string;

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
};

export type DriverSession = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type LoginRequest = {
  phone: string;
  pin: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type DriverRegisterRequest = {
  firstName: string;
  lastName: string;
  phone: string;
  pin: string;
  referralCode?: string;
  referral?: string;
  affiliationCode?: string;
  aff?: string;
};

export type DriverRegisterResponse = LoginResponse;
