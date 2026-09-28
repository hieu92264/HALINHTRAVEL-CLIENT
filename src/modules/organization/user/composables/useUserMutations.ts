import { UserService } from '@/services/user.service'
import { useQuery } from '@tanstack/vue-query'

export const userQueryKeys = {
  all: ['users'] as const,
}

export function useUserQuery() {
  return useQuery({
    queryKey: userQueryKeys.all,
    queryFn: UserService.getUsers,
  })
}
