export function calculateTouristDriverWage(
  freightAmount: string | number,
  tourismWageRate: string | number | null | undefined,
  hasCompanyDriver: boolean,
): { driverWageRate: string; driverWage: string } {
  if (!hasCompanyDriver || tourismWageRate === null || tourismWageRate === undefined) {
    return { driverWageRate: '0', driverWage: '0.00' }
  }

  const driverWageRate = Number(tourismWageRate)
  return {
    driverWageRate: String(driverWageRate),
    driverWage: (Number(freightAmount || 0) * driverWageRate).toFixed(2),
  }
}
