const labels: Record<string, string> = {
  fixed_trip: 'Lương chuyến cố định',
  tourism_commission: 'Hoa hồng chuyến du lịch',
  direct_customer_collection: 'Khách trả trực tiếp',
  driver_reimbursement: 'Lái xe tự chi',
  driver_cash_remittance: 'Lái xe nộp tiền',
  allowance: 'Phụ cấp',
}
export const payrollCalculationLabel = (value: string) => labels[value] ?? value
