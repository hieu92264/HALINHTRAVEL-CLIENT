import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
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

function getColumnSizeVariable(table: HTMLTableElement): string {
  const variable = Array.from(table.style).find(
    (property) => property.startsWith('--data-grid-column-') && property.endsWith('-size'),
  )

  if (!variable) throw new Error('Không tìm thấy CSS variable kích thước cột.')
  return variable
}

async function flushAnimationFrame(): Promise<void> {
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))
}

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
})

describe('DataGrid', () => {
  it('uses CSS variables for column width, content height, alignment, and a full-value tooltip', () => {
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
    const table = wrapper.get('table').element as HTMLTableElement
    const sizeVariable = getColumnSizeVariable(table)

    expect(table.style.getPropertyValue(sizeVariable)).toBe('160')
    expect(cell?.getAttribute('style')).toContain(`width: calc(var(${sizeVariable}) * 1px)`)
    expect(content.classes()).toEqual(expect.arrayContaining(['truncate', 'justify-end', 'text-right']))
    expect(content.attributes('style')).toContain('min-height: 60px')
    expect(content.attributes('title')).toBe(email)

    wrapper.unmount()
  })

  it('updates CSS variables while resizing and persists only the final constrained size', async () => {
    const persist = vi.spyOn(Storage.prototype, 'setItem')
    const wrapper = mount(DataGrid<Row>, {
      props: {
        columns: [{ ...columns[0]!, minWidth: 120, maxWidth: 200 }],
        dataSource: { data: [{ id: 1, email: 'resize@example.test' }] },
        getRowId: (row) => String(row.id),
        persist: { key: 'data-grid-resize-test' },
      },
    })
    const table = wrapper.get('table').element as HTMLTableElement
    const sizeVariable = getColumnSizeVariable(table)
    const resizer = wrapper.get('.data-grid-resizer')
    await nextTick()
    persist.mockClear()

    await resizer.trigger('mousedown', { clientX: 0 })
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 500 }))
    await flushAnimationFrame()

    expect(table.style.getPropertyValue(sizeVariable)).toBe('200')
    expect(persist).not.toHaveBeenCalled()

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 500 }))
    await Promise.resolve()
    await nextTick()

    expect(persist).toHaveBeenCalledTimes(1)
    expect(table.style.getPropertyValue(sizeVariable)).toBe('200')

    await resizer.trigger('mousedown', { clientX: 0 })
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: -500 }))
    await flushAnimationFrame()
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: -500 }))
    await Promise.resolve()
    await nextTick()

    expect(table.style.getPropertyValue(sizeVariable)).toBe('120')
    wrapper.unmount()
  })
})
