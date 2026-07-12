import { UserRole } from '../../shared/types';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  departmentId?: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SendOtpInput {
  email: string;
}

export interface VerifyOtpInput {
  email: string;
  code: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface PendingSignup {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  departmentId?: string;
  code: string;
  attempts: number; // Verification attempts (max 5)
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  department_id: string | null;
  xp_total: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface OtpRecord {
  id: string;
  email: string;
  otp_code: string;
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  is_revoked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponseData {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    departmentId: string | null;
    xpTotal: number;
    isVerified: boolean;
  };
  token: string; // Access Token
  refreshToken?: string;
}
