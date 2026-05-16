import { CashbackSummary } from './cashback';
import { ReferralSummary } from './referral';
import { RecentTransaction } from './transaction';

export type DriverProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone: string;
  role?: string;
  status?: string;
  qrCodeToken?: string;
  referralCode?: string;
};

export type DriverQr = {
  token?: string;
};

export type DriverDashboardData = {
  driver?: DriverProfile;
  qr?: DriverQr;
  cashback?: CashbackSummary;
  recentTransactions?: RecentTransaction[];
  referralSummary?: ReferralSummary;
};
