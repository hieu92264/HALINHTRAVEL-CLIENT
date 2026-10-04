import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url('VITE_API_BASE_URL phải là một URL hợp lệ.'),
})

const parsedEnv = envSchema.safeParse({
  ...import.meta.env,
  VITE_API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.MODE === 'test' ? 'http://localhost:8000/api' : undefined),
})

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues.map((issue) => issue.message).join(' ')
  throw new Error(`Cấu hình môi trường không hợp lệ: ${details}`)
}

export const apiBaseUrl = parsedEnv.data.VITE_API_BASE_URL
