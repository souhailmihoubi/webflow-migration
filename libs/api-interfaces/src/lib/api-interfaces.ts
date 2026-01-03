export interface Message {
  message: string;
}

export class RegisterDto {
  firstName!: string;
  lastName!: string;
  phone!: string;
  email!: string;
  password!: string;
  role?: 'ADMIN' | 'CUSTOMER';
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class ChangePasswordDto {
  oldPassword!: string;
  newPassword!: string;
}

export class ForgotPasswordDto {
  email!: string;
}

export class ResetPasswordDto {
  token!: string;
  newPassword!: string;
}

export class UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
