export function decimalRateToPercent(value: string | number | null | undefined): number {
  const rate = Number(value ?? 0)
  return Number.isFinite(rate) ? Number((rate * 100).toFixed(2)) : 0
}

export function percentToDecimalRate(value: number): string {
  return (value / 100).toFixed(4)
}

export function isValidTourismWagePercent(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
}
