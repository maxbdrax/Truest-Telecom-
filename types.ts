
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUB_ADMIN = 'SUB_ADMIN'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  balance: number;
  driveBalance: number;
  isBlocked: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'RECHARGE' | 'SEND_MONEY' | 'BANK_TRANSFER' | 'BILL_PAY' | 'CASH_OUT' | 'LOAN';
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  date: string;
  details: string;
}

export interface ServiceStatus {
  id: string;
  name: string;
  isActive: boolean;
  requiresVerification: boolean;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  services: ServiceStatus[];
}
