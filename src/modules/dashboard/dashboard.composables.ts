import { DashboardService } from '@/services/dashboard.service'
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

export const dashboardQueryKeys = {
  overview: (date: string) => ['dashboard', 'overview', date] as const,
}

export const useDashboardOverviewQuery = (date: () => string) =>
  useQuery({
    queryKey: computed(() => dashboardQueryKeys.overview(date())),
    queryFn: () => DashboardService.getOverview(date()),
    staleTime: 15_000,
    refetchInterval: 10 * 60_000,
    refetchIntervalInBackground: false,
  })
