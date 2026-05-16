import { DriverTransaction } from '../../types/transaction';

function toNumber(value: number | string | undefined | null): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function formatMoney(value: number | string | undefined | null): string {
  const amount = toNumber(value);
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export function formatLiters(value: number | string | undefined | null): string {
  const liters = toNumber(value);
  if (!liters) {
    return '-';
  }
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(liters) + ' L';
}

export function formatDate(value: string | undefined | null): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value: string | undefined | null): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const datePart = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return `${datePart} • ${timePart}`;
}

export function formatTransactionStatus(status: string | undefined): string {
  const normalized = (status ?? '').toUpperCase();

  if (normalized === 'CONFIRMED' || normalized === 'COMPLETED') {
    return 'Confirmee';
  }
  if (normalized === 'PENDING') {
    return 'En attente';
  }
  if (normalized === 'CANCELLED') {
    return 'Annulee';
  }
  if (normalized === 'FAILED') {
    return 'Echouee';
  }

  return status || '-';
}

export function getTransactionStatusTone(status: string | undefined): 'success' | 'warning' | 'danger' | 'neutral' {
  const normalized = (status ?? '').toUpperCase();

  if (normalized === 'CONFIRMED' || normalized === 'COMPLETED') {
    return 'success';
  }
  if (normalized === 'PENDING') {
    return 'warning';
  }
  if (normalized === 'CANCELLED' || normalized === 'FAILED') {
    return 'danger';
  }

  return 'neutral';
}

export function formatFuelType(fuelType: string | undefined): string {
  if (!fuelType) {
    return '-';
  }

  const normalized = fuelType.toLowerCase();
  if (normalized === 'diesel') {
    return 'Diesel';
  }
  if (normalized === 'super' || normalized === 'essence') {
    return 'Essence';
  }

  return fuelType;
}

export function getTransactionStationName(transaction: DriverTransaction): string {
  return (
    transaction.stationName ||
    transaction.station?.name ||
    transaction.organizationName ||
    transaction.organization?.name ||
    'Station inconnue'
  );
}

export function formatCashbackStatus(status: string | undefined): string {
  const normalized = (status ?? '').toUpperCase();

  if (normalized === 'CONFIRMED' || normalized === 'COMPLETED' || normalized === 'AVAILABLE') {
    return 'Disponible';
  }
  if (normalized === 'PENDING') {
    return 'En attente';
  }
  if (normalized === 'CANCELLED' || normalized === 'FAILED') {
    return 'Annule';
  }

  return status || '-';
}

export function getCashbackStatusTone(status: string | undefined): 'success' | 'warning' | 'danger' | 'neutral' {
  const normalized = (status ?? '').toUpperCase();

  if (normalized === 'CONFIRMED' || normalized === 'COMPLETED' || normalized === 'AVAILABLE') {
    return 'success';
  }
  if (normalized === 'PENDING') {
    return 'warning';
  }
  if (normalized === 'CANCELLED' || normalized === 'FAILED') {
    return 'danger';
  }

  return 'neutral';
}

export function formatReferralBonusStatus(status: string | undefined): string {
  const normalized = (status ?? '').toUpperCase();

  if (normalized === 'AVAILABLE') {
    return 'Disponible';
  }
  if (normalized === 'PENDING') {
    return 'En progression';
  }

  return status || '-';
}

export function getReferralBonusStatusTone(status: string | undefined): 'success' | 'warning' | 'danger' | 'neutral' {
  const normalized = (status ?? '').toUpperCase();

  if (normalized === 'AVAILABLE') {
    return 'success';
  }
  if (normalized === 'PENDING') {
    return 'warning';
  }
  if (normalized === 'FAILED' || normalized === 'CANCELLED') {
    return 'danger';
  }

  return 'neutral';
}

export function formatProgress(count: number | undefined, target = 3): string {
  return `${count ?? 0} / ${target} transactions`;
}
