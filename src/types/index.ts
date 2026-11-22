export type UserRole = "customer" | "admin";
export type ServiceStatus = "active" | "inactive";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";
export type TransactionStatus = "paid" | "failed";

export interface SalonUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  isBlocked: boolean;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalonService {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface AppointmentServiceRef {
  _id: string;
  serviceName: string;
  category: string;
  image: string;
  duration: number;
  price?: number;
  status?: ServiceStatus;
}

export interface AppointmentCustomerRef {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  isBlocked?: boolean;
}

export interface SalonAppointment {
  _id: string;
  serviceId: AppointmentServiceRef | string;
  customerId: AppointmentCustomerRef | string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: PaymentStatus;
  status: AppointmentStatus;
  createdAt: string;
}

export interface SalonTransaction {
  _id: string;
  appointmentId:
    | {
        _id: string;
        appointmentDate: string;
        timeSlot: string;
        status: AppointmentStatus;
        paymentStatus: PaymentStatus;
        serviceId?: {
          _id: string;
          serviceName: string;
          category: string;
          price?: number;
        };
      }
    | string;
  customerId: AppointmentCustomerRef | string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface CustomerOverviewStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
}

export interface AdminOverviewStats {
  totalCustomers: number;
  totalActiveServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalSuccessfulPayments: number;
}
