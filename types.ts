
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUB_ADMIN = 'SUB_ADMIN'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  role: UserRole;
  balance: number;
  driveBalance: number;
  isBlocked: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'RECHARGE' | 'SEND_MONEY' | 'BANK_TRANSFER' | 'BILL_PAY' | 'CASH_OUT' | 'LOAN' | 'SAVINGS' | 'DRIVE_PACK' | 'ADD_MONEY' | 'LOAN_INSTALLMENT' | 'REGULAR_PACK';
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  date: string;
  details: string;
  operator?: string;
}

export interface ServiceStatus {
  id: string;
  name: string;
  isActive: boolean;
  requiresVerification: boolean;
}

export interface AppSettings {
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  banners: string[];
}

export interface Offer {
  id: string;
  type: 'REGULAR' | 'DRIVE';
  title: string;
  price: number;
  regularPrice: number;
  operator: string;
  validity: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface Loan {
  id: string;
  userId: string;
  amount: number;
  remainingAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  status: 'PENDING' | 'ACTIVE' | 'REPAID';
  date: string;
}

export interface Savings {
  id: string;
  userId: string;
  planName: string;
  monthlyAmount: number;
  totalMonths: number;
  paidMonths: number;
  startDate: string;
  status: 'ACTIVE' | 'WITHDRAWN';
}
