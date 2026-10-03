import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DataGrid from './DataGrid.vue'
import type { DataGridColumnDef } from './types'

type Row = {
  id: number
  email: string
}

const columns: DataGridColumnDef<Row>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    width: 160,
    height: 60,
    align: 'right',
  },
]

describe('DataGrid', () => {
  it('uses column width, minimum content height, alignment, and a full-value tooltip', () => {
    const email = 'nguyen.van.an@example.test'
    const wrapper = mount(DataGrid<Row>, {
      props: {
        columns,
        dataSource: { data: [{ id: 1, email }] },
        getRowId: (row) => String(row.id),
      },
    })

    const content = wrapper.get('[data-data-grid-cell-content]')
    const cell = content.element.closest('td')

    expect(cell?.getAttribute('style')).toContain('width: 160px')
    expect(content.classes()).toEqual(expect.arrayContaining(['truncate', 'justify-end', 'text-right']))
    expect(content.attributes('style')).toContain('min-height: 60px')
    expect(content.attributes('title')).toBe(email)
  })
})
