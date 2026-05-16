export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export const statusColors: Record<StatusTone, { bg: string; border: string; text: string }> = {
  success: {
    bg: '#DCFCE7',
    border: '#86EFAC',
    text: '#166534',
  },
  warning: {
    bg: '#FEF3C7',
    border: '#FCD34D',
    text: '#92400E',
  },
  danger: {
    bg: '#FEE2E2',
    border: '#FCA5A5',
    text: '#991B1B',
  },
  neutral: {
    bg: '#F8FAFC',
    border: '#D9E2EC',
    text: '#475569',
  },
};
