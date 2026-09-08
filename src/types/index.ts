export type LeadStatus = 'New' | 'Contacted' | 'Quotation Sent' | 'Follow-up' | 'Confirmed' | 'Lost' | 'Completed';
export type BookingStatus = 'Confirmed' | 'Packing' | 'Loading' | 'In Transit' | 'Delivered' | 'Completed' | 'Cancelled';
export type InvoiceStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue';
export type PropertyType = '1 BHK' | '2 BHK' | '3 BHK' | '4 BHK' | 'Villa' | 'Office' | 'Other';
export type LeadSource = 'Google' | 'WhatsApp' | 'Instagram' | 'Facebook' | 'Referral' | 'Website' | 'Other';
export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other';
export type ExpenseCategory = 'Fuel & Toll' | 'Labour & Handling' | 'Vehicle Maintenance' | 'Packing Supplies' | 'Office & Rent' | 'Marketing' | 'Driver Allowance' | 'Other';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CompanySettings extends Partial<BaseEntity> {
  companyName: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  gstNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  invoicePrefix: string;
  invoiceStartNumber: number;
  quotationPrefix: string;
  quotationStartNumber: number;
  taxRate: number;
  terms: string;
  invoiceTerms?: string;
  logoUrl?: string;
}

export interface ServicePrice extends BaseEntity {
  name: string;
  defaultPrice: number;
  category?: string;
  isActive?: boolean;
  unit?: string;
}

export interface Customer extends BaseEntity {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address?: string;
  city?: string;
  notes?: string;
}

export interface Lead extends BaseEntity {
  customerId: string;
  movingDate: string;
  pickupLocation: string;
  dropLocation: string;
  propertyType: PropertyType;
  floorNumber: string;
  liftAvailable: boolean;
  parkingAvailable: boolean;
  packingRequired: boolean;
  loadingRequired: boolean;
  unloadingRequired: boolean;
  unpackingRequired: boolean;
  vehicleRequired: boolean;
  source: LeadSource;
  status: LeadStatus;
  notes: string;
  estimatedValue: number;
}

export interface QuotationItem {
  id: string;
  service: string;
  description: string;
  qty: number;
  unitPrice: number;
  discount: number;
  amount: number;
}

export interface Quotation extends BaseEntity {
  quotationNumber: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  toDetails?: string;
  subject?: string;
  introParagraph?: string;
  termsList?: string[];
  leadId?: string;
  date: string;
  validUntil: string;
  movingDate: string;
  pickupAddress: string;
  dropAddress: string;
  propertyType: PropertyType;
  floor: string;
  lift: boolean;
  parking: boolean;
  distance: string;
  vehicleType: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  notes: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
}

export interface Booking extends BaseEntity {
  bookingNumber: string;
  customerId: string;
  quotationId?: string;
  movingDate: string;
  pickupLocation: string;
  dropLocation: string;
  vehicle: string;
  driver: string;
  workers: number;
  status: BookingStatus;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  notes: string;
}

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  customerId: string;
  quotationId?: string;
  bookingId?: string;
  date: string;
  dueDate: string;
  poNumber?: string;
  gstType?: string; // 'NILL' or GSTIN
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  tax: number;
  centralTax?: number;
  stateTax?: number;
  otherCharges?: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes: string;

  // Fully Editable Customer, Logistics & Document fields
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerGst?: string;
  billToDetails?: string;
  moveFromAddress?: string;
  moveFromCityStatePin?: string;
  moveToName?: string;
  moveToPhone?: string;
  moveToGst?: string;
  moveToAddress?: string;
  moveToCityStatePin?: string;
  vehicleNo?: string;
  packageCount?: string;
  weightVolume?: string;
  packageCondition?: string;
  demurrageSchedule?: string;
  documentTitle?: string;
}

export interface Payment extends BaseEntity {
  invoiceId: string;
  customerId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  referenceNumber: string;
  notes: string;
}

export interface Expense extends BaseEntity {
  name: string;
  category: ExpenseCategory | string;
  amount: number;
  date: string;
  method: PaymentMethod | string;
  notes: string;
  receiptNumber?: string;
}

export type EntityType = 'customer' | 'lead' | 'quotation' | 'booking' | 'invoice' | 'payment' | 'expense';

export interface SearchResultItem {
  id: string;
  type: EntityType;
  title: string;
  subtitle: string;
  badge: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';
  meta: string;
  url: string;
  date?: string;
}

export interface BusinessAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  category: 'move' | 'payment' | 'lead' | 'quote' | 'crew';
  title: string;
  message: string;
  link: string;
  actionLabel?: string;
  timestamp: string;
}
