import type { UserRole } from './index';

export interface MockUser {
  email: string;
  password: string;
  name: string;
  roles: UserRole[];
}

export interface AuthSession {
  user: MockUser;
  selectedRole: UserRole;
  loggedInAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}
