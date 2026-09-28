import { z } from 'zod'

export const loginSchema = z.object({
  user_name: z.string().trim().min(1, 'Vui lòng nhập tên đăng nhập hoặc email.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
  remember_me: z.boolean(),
})

export type LoginCredentials = z.infer<typeof loginSchema>
