import z from 'zod'

export const optionalNullableText = z.preprocess((value) => {
  if (typeof value !== 'string') return value

  const normalized = value.trim()
  return normalized || null
}, z.string().nullable().optional())
