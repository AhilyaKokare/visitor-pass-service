// Basic models for authentication and user context
export interface JwtPayload {
  sub?: string;
  userId: number;
  role: 'ROLE_SUPER_ADMIN' | 'ROLE_TENANT_ADMIN' | 'ROLE_EMPLOYEE' | 'ROLE_APPROVER' | 'ROLE_SECURITY';
  tenantId?: number;        // some backends use camelCase
  tenant_id?: number;       // some backends use snake_case
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}