export type ReferralBonusStatus = 'PENDING' | 'AVAILABLE' | string;

export type ReferralItem = {
  driverId?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  confirmedTransactionsCount?: number;
  bonusStatus?: ReferralBonusStatus;
  bonusAmount?: number | string;
  createdAt?: string;
  affiliatedAt?: string;
};

export type ReferralSummary = {
  referralCode?: string;
  totalReferralsCount?: number;
  activeReferralsCount?: number;
  pendingReferralsCount?: number;
  eligibleReferralsCount?: number;
  availableBonusAmount?: number | string;
  pendingBonusAmount?: number | string;
  referrals?: ReferralItem[];
};
