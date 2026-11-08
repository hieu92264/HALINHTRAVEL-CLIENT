import { describe, expect, it } from 'vitest'

import { decimalRateToPercent, isValidTourismWagePercent, percentToDecimalRate } from './tourism-wage-rate'

describe('tourism wage rate conversion', () => {
  it.each([
    ['0.1', 10],
    ['0.105', 10.5],
    [0, 0],
  ])('displays the stored decimal rate %s as %s percent', (rate, expected) => {
    expect(decimalRateToPercent(rate)).toBe(expected)
  })

  it.each([
    [10, '0.1000'],
    [10.5, '0.1050'],
  ])('serializes %s percent as decimal rate %s', (percent, expected) => {
    expect(percentToDecimalRate(percent)).toBe(expected)
  })

  it.each([-0.01, 100.01, Number.NaN])('rejects an invalid percentage: %s', (percent) => {
    expect(isValidTourismWagePercent(percent)).toBe(false)
  })
})
