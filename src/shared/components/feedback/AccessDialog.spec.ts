import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import AccessDialog from './AccessDialog.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('AccessDialog', () => {
  it('renders the supplied labels and emits confirmation', async () => {
    const wrapper = mount(AccessDialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: 'Hủy hợp đồng',
        description: 'Hợp đồng HD20260005 sẽ bị hủy.',
        confirmLabel: 'Hủy hợp đồng',
        cancelLabel: 'Quay lại',
        destructive: true,
      },
    })

    expect(document.body.textContent).toContain('Hủy hợp đồng')
    expect(document.body.textContent).toContain('Hợp đồng HD20260005 sẽ bị hủy.')

    const buttons = document.body.querySelectorAll('button')
    expect(buttons[0]?.textContent).toBe('Quay lại')
    expect(buttons[1]?.getAttribute('data-variant')).toBe('destructive')

    buttons[1]?.click()
    await nextTick()

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    wrapper.unmount()
  })

  it('does not close by button, overlay, or Escape while pending', async () => {
    const wrapper = mount(AccessDialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: 'Hủy hợp đồng',
        pending: true,
      },
    })

    const dialog = document.body.querySelector('[role="dialog"]')
    const overlay = dialog?.parentElement
    const buttons = document.body.querySelectorAll('button')

    buttons[0]?.click()
    overlay?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('close')).toBeUndefined()
    expect(document.body.textContent).toContain('Đang lưu…')
    wrapper.unmount()
  })
})
