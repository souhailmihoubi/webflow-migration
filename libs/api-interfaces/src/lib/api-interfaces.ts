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
