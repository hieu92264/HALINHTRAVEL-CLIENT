const customer: Record<string, string> = { company: 'Công ty', individual: 'Cá nhân' }
const partner: Record<string, string> = {
  transport_company: 'Công ty vận tải',
  vehicle_owner: 'Chủ xe',
  garage: 'Gara sửa chữa',
  fuel_supplier: 'Nhà cung cấp nhiên liệu',
  other: 'Khác',
}
const ownership: Record<string, string> = { company: 'Công ty', partner: 'Đối tác' }
export const customerTypeLabel = (value: string) => customer[value] ?? value ?? '—'
export const partnerTypeLabel = (value: string) => partner[value] ?? value ?? '—'
export const ownershipTypeLabel = (value: string) => ownership[value] ?? value ?? '—'
