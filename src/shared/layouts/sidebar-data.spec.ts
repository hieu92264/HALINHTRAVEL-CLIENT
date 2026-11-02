import { describe, expect, it } from 'vitest'
import { sidebarNavigation, type SidebarGroup } from './sidebar-data'

describe('điều hướng theo schema xe chạy mới', () => {
  it('giữ báo cáo ở một điểm vào và không còn nhóm luồng thuê xe hoặc điều hành cũ', () => {
    const routeNames = sidebarNavigation.flatMap((node) =>
      node.kind === 'group' ? node.items.map((item) => item.routeName) : [node.routeName],
    )

    expect(routeNames).toContain('reports')
    expect(routeNames).toContain('worker-vehicles')
    expect(routeNames).toContain('tourist-vehicles')
    expect(sidebarNavigation.some((node): node is SidebarGroup => node.kind === 'group' && ['reports', 'rental', 'dispatch', 'driver-space'].includes(node.id))).toBe(false)
  })
})
