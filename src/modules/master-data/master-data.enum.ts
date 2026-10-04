export enum CustomerTypeEnum {
  INDIVIDUAL = 'individual', // cá nhân
  COMPANY = 'company', // công ty
}

export enum PartnerTypeEnum {
  TRANSPORT_COMPANY = 'transport_company', //công ty vận tải
  VEHICLE_OWNER = 'vehicle_owner', //chủ xe
  GARAGE = 'garage',
  FUEL_SUPPLIER = 'fuel_supplier', //nhà cung cấp nhiên liệu
  OTHER = 'other',
}

export enum OwnershipTypeEnum {
  COMPANY = 'company', // công ty
  INDIVIDUAL = 'partner', // đối tác
}

export enum VehicleStatusEnum {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
  OTHER = 'other',
}

export enum ExpenseTypeEnum {
  VEHICLE = 'vehicle',
  TRIP = 'trip',
  GENERAL = 'general',
}
