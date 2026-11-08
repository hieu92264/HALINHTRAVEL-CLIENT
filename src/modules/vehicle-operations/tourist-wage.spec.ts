import { describe, expect, it } from 'vitest'
import { calculateTouristDriverWage } from './tourist-wage'

describe('calculateTouristDriverWage', () => {
  it('uses the selected vehicle type rate for an internal driver', () => {
    expect(calculateTouristDriverWage(5_000_000, '0.105', true)).toEqual({
      driverWageRate: '0.105',
      driverWage: '525000.00',
    })
  })

  it('does not calculate driver wages for an external or hired-driver trip', () => {
    expect(calculateTouristDriverWage(5_000_000, '0.105', false)).toEqual({
      driverWageRate: '0',
      driverWage: '0.00',
    })
  })

  it('calculates a manual trip-rate snapshot without accepting a manual wage', () => {
    expect(calculateTouristDriverWage(5_000_000, '0.125', true)).toEqual({
      driverWageRate: '0.125',
      driverWage: '625000.00',
    })
  })
})
