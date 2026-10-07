import type {
  AvailabilityPayload,
  AvailabilityResult,
  PublicQuotation,
  Quotation,
  QuotationPayload,
  RentalRequest,
  RentalRequestPayload,
} from '@/modules/rental/rental.types'
import { httpService } from '@/services/http.service'

const rentalUrl = '/rental'

export class RentalService {
  static getRequests(): Promise<RentalRequest[]> {
    return httpService.get(`${rentalUrl}/requests`)
  }

  static getRequest(id: number): Promise<RentalRequest> {
    return httpService.get(`${rentalUrl}/requests/${id}`)
  }

  static createRequest(payload: RentalRequestPayload): Promise<RentalRequest> {
    return httpService.post(`${rentalUrl}/requests`, payload)
  }

  static updateRequest(id: number, payload: Partial<RentalRequestPayload>): Promise<RentalRequest> {
    return httpService.patch(`${rentalUrl}/requests/${id}`, payload)
  }

  static deleteRequest(id: number): Promise<void> {
    return httpService.delete(`${rentalUrl}/requests/${id}`)
  }

  static getQuotations(): Promise<Quotation[]> {
    return httpService.get(`${rentalUrl}/quotations`)
  }

  static getQuotation(id: number): Promise<Quotation> {
    return httpService.get(`${rentalUrl}/quotations/${id}`)
  }

  static createQuotation(payload: QuotationPayload): Promise<Quotation> {
    return httpService.post(`${rentalUrl}/quotations`, payload)
  }

  static updateQuotation(id: number, payload: Partial<QuotationPayload>): Promise<Quotation> {
    return httpService.patch(`${rentalUrl}/quotations/${id}`, payload)
  }

  static deleteQuotation(id: number): Promise<void> {
    return httpService.delete(`${rentalUrl}/quotations/${id}`)
  }

  static sendQuotation(id: number): Promise<Quotation> {
    return httpService.post(`${rentalUrl}/quotations/${id}/send`)
  }

  static expireQuotation(id: number): Promise<Quotation> {
    return httpService.post(`${rentalUrl}/quotations/${id}/expire`)
  }

  static recordCustomerResponse(
    id: number,
    payload: { accepted: boolean; note?: string | null },
  ): Promise<Quotation> {
    return httpService.post(`${rentalUrl}/quotations/${id}/record-customer-response`, payload)
  }

  static getPublicQuotation(token: string): Promise<PublicQuotation> {
    return httpService.get(`/public/quotation-responses/${encodeURIComponent(token)}`)
  }

  static acceptPublicQuotation(token: string): Promise<PublicQuotation> {
    return httpService.post(`/public/quotation-responses/${encodeURIComponent(token)}/accept`)
  }

  static rejectPublicQuotation(token: string, note?: string | null): Promise<PublicQuotation> {
    return httpService.post(`/public/quotation-responses/${encodeURIComponent(token)}/reject`, {
      note,
    })
  }

  static checkAvailability(payload: AvailabilityPayload): Promise<AvailabilityResult> {
    return httpService.post('/dispatch/availability', payload)
  }
}
