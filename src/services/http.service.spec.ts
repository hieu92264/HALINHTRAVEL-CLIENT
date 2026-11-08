import AxiosMockAdapter from 'axios-mock-adapter'
import { afterEach, describe, expect, it } from 'vitest'

import { apiClient } from '@/configs/axios.config'
import { httpService } from './http.service'

describe('httpService.downloadPdf', () => {
  const mock = new AxiosMockAdapter(apiClient)

  afterEach(() => mock.reset())

  it('returns a non-empty PDF and its server filename', async () => {
    const blob = new Blob(['%PDF-1.7 report'], { type: 'application/pdf' })
    mock.onGet('/reports/pdf').reply(200, blob, {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="bao-cao.pdf"',
    })

    await expect(httpService.downloadPdf('/reports/pdf')).resolves.toMatchObject({
      blob,
      filename: 'bao-cao.pdf',
      contentType: 'application/pdf',
    })
  })

  it('uses report.pdf when the server does not provide a filename', async () => {
    mock.onGet('/reports/without-name').reply(200, new Blob(['%PDF-1.7'], { type: 'application/pdf' }), {
      'content-type': 'application/pdf',
    })

    await expect(httpService.downloadPdf('/reports/without-name')).resolves.toMatchObject({ filename: 'report.pdf' })
  })

  it('rejects an empty or non-PDF success response', async () => {
    mock.onGet('/reports/empty').reply(200, new Blob([], { type: 'application/pdf' }), {
      'content-type': 'application/pdf',
    })
    mock.onGet('/reports/not-pdf').reply(200, new Blob([JSON.stringify({ message: 'Báo cáo chưa sẵn sàng.' })], { type: 'application/json' }), {
      'content-type': 'application/json',
    })

    await expect(httpService.downloadPdf('/reports/empty')).rejects.toThrow('Tệp PDF không có dữ liệu')
    await expect(httpService.downloadPdf('/reports/not-pdf')).rejects.toThrow('Báo cáo chưa sẵn sàng.')
  })

  it('reads a Vietnamese API error returned as a blob', async () => {
    mock.onGet('/reports/error').reply(422, new Blob([JSON.stringify({ message: 'Khoảng ngày không hợp lệ.' })], { type: 'application/json' }), {
      'content-type': 'application/json',
    })

    await expect(httpService.downloadPdf('/reports/error')).rejects.toMatchObject({
      message: 'Khoảng ngày không hợp lệ.',
      statusCode: 422,
    })
  })

  it('returns an Excel file and uses report.xlsx without a server filename', async () => {
    const blob = new Blob(['PK spreadsheet'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    mock.onGet('/reports/excel').reply(200, blob, {
      'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    await expect(httpService.downloadExcel('/reports/excel')).resolves.toMatchObject({
      blob,
      filename: 'report.xlsx',
    })
  })

  it('rejects an empty or invalid Excel response', async () => {
    mock.onGet('/reports/empty-excel').reply(200, new Blob([], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }), {
      'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    mock.onGet('/reports/not-excel').reply(200, new Blob([JSON.stringify({ message: 'Báo cáo chưa sẵn sàng.' })], {
      type: 'application/json',
    }), { 'content-type': 'application/json' })

    await expect(httpService.downloadExcel('/reports/empty-excel')).rejects.toThrow('Tệp Excel không có dữ liệu')
    await expect(httpService.downloadExcel('/reports/not-excel')).rejects.toThrow('Báo cáo chưa sẵn sàng.')
  })
})
