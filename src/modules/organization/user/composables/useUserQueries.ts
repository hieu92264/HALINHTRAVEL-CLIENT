import { useQuery } from '@tanstack/vue-query'
import { UserService } from '@/services/user.service'

export const userQueryKeys = {
  all: ['users'] as const,
}

export function useUserQuery() {
  return useQuery({
    queryKey: userQueryKeys.all,
    queryFn: UserService.getUsers,
  })
}
