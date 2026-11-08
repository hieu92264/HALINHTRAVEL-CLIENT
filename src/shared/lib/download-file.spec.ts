import { afterEach, describe, expect, it, vi } from 'vitest'

import { downloadFile } from './download-file'

describe('downloadFile', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.replaceChildren()
  })

  it('clicks a temporary download link and revokes its object URL afterwards', () => {
    vi.useFakeTimers()
    const createObjectURL = vi.fn(() => 'blob:report')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    downloadFile({
      blob: new Blob(['%PDF-1.7'], { type: 'application/pdf' }),
      filename: 'bao-cao.pdf',
      contentType: 'application/pdf',
    })

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(document.querySelector('a')).toBeNull()

    vi.runAllTimers()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report')
  })
})
