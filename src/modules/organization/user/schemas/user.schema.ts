import z from 'zod'

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Please enter a valid email address.')

export const createUserSchema = z.object({
  user_name: z
    .string()
    .trim()
    .min(1, 'Username is required.')
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username must be at most 50 characters.')
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      'Username can only contain letters, numbers, dots, underscores, and hyphens.',
    ),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export const updateUserSchema = z.object({
  email: emailSchema,
})

export type CreateUserDto = z.infer<typeof createUserSchema>
export type UpdateUserDto = z.infer<typeof updateUserSchema>
