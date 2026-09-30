import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { UserService, type UserPayload, type UserRow } from '@/services/user.service'
import { userQueryKeys } from './useUserQueries'

export function useUserMutations() {
  const client = useQueryClient()

  function invalidate() {
    return client.invalidateQueries({ queryKey: userQueryKeys.all })
  }

  /** Tạo tài khoản mới */
  const create = useMutation({
    mutationFn: (
      payload: Required<Pick<UserPayload, 'user_name' | 'email' | 'password'>> & UserPayload,
    ) => UserService.createUser(payload),
    onSuccess: async () => {
      toast.success('Đã tạo tài khoản.')
      await invalidate()
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Không thể tạo tài khoản.'),
  })

  /** Cập nhật thông tin tài khoản (email, is_active, ...) */
  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string
      payload: Omit<UserPayload, 'user_name' | 'role_ids'>
    }) => UserService.updateUser(id, payload),
    onSuccess: async () => {
      toast.success('Đã cập nhật tài khoản.')
      await invalidate()
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Không thể cập nhật tài khoản.'),
  })

  /**
   * Vô hiệu hoá / kích hoạt lại tài khoản.
   * Backend dùng DELETE để deactivate và PUT is_active=true để re-activate.
   */
  const toggleActive = useMutation({
    mutationFn: async ({ user }: { user: UserRow }): Promise<void> => {
      if (user.is_active) {
        await UserService.deactivateUser(user.id)
      } else {
        await UserService.updateUser(user.id, { is_active: true })
      }
    },
    onSuccess: async (_data, { user }) => {
      toast.success(user.is_active ? 'Đã vô hiệu hoá tài khoản.' : 'Đã kích hoạt lại tài khoản.')
      await invalidate()
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Không thể thay đổi trạng thái.'),
  })

  return { create, update, toggleActive }
}
