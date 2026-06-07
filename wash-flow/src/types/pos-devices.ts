export interface PosDevice {
  id: string;
  posCode: string;
  deviceName: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashierAccount {
  id: string;
  posDeviceId: string;
  employeeId?: string;
  username: string;
  fullName: string;
  status: 'active' | 'inactive';
  failedAttempts: number;
  lockedUntil?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashierSession {
  sessionId: string;
  cashierAccountId: string;
  posDeviceId: string;
  cashierName: string;
  posCode: string;
  expiresAt: string;
}
