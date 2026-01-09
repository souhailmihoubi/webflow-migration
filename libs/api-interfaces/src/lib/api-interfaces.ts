import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export interface Message {
  message: string;
}

// Auth DTOs
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsString()
  role?: 'ADMIN' | 'CUSTOMER';
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
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

// Category DTOs
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  showInHomePage?: boolean;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  showInHomePage?: boolean;
}

// Product DTOs
// Product DTOs
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  mainImage!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  multiImages?: string[];

  @IsOptional()
  @IsString()
  priceDetails?: string;

  @IsString()
  @IsNotEmpty()
  productDescription!: string;

  @IsOptional()
  @IsString()
  caracteristiques?: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsOptional()
  @IsBoolean()
  showInMenu?: boolean;

  @IsOptional()
  @IsString()
  videoLink?: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  mainImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  multiImages?: string[];

  @IsOptional()
  @IsString()
  priceDetails?: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsOptional()
  @IsString()
  caracteristiques?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsOptional()
  @IsBoolean()
  showInMenu?: boolean;

  @IsOptional()
  @IsString()
  videoLink?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}

// Cart & Order DTOs
export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @IsNotEmpty()
  quantity!: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;
}

// Payment Enums
export enum PaymentMethod {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentPlan {
  FULL = 'FULL',
  DEPOSIT_50 = 'DEPOSIT_50',
}

export class PlaceOrderDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  shippingAddress!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsNumber()
  shippingCost!: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  paymentPlan?: PaymentPlan;

  @IsArray()
  items!: {
    productId?: string;
    packId?: string;
    quantity: number;
  }[];
}

// Pack DTOs
export class CreatePackDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  mainImage?: string;

  @IsString()
  @IsNotEmpty()
  productSamId!: string;

  @IsString()
  @IsNotEmpty()
  productCacId!: string;

  @IsString()
  @IsNotEmpty()
  productSalonId!: string;

  @IsOptional()
  @IsNumber()
  discountPercentage?: number;

  @IsOptional()
  @IsBoolean()
  showInMenu?: boolean;
}

export class UpdatePackDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  mainImage?: string;

  @IsOptional()
  @IsString()
  productSamId?: string;

  @IsOptional()
  @IsString()
  productCacId?: string;

  @IsOptional()
  @IsString()
  productSalonId?: string;

  @IsOptional()
  @IsNumber()
  discountPercentage?: number;

  @IsOptional()
  @IsBoolean()
  showInMenu?: boolean;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  mainImage: string;
  price: number;
  discountPrice?: number;
}

export interface PackDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  mainImage?: string;
  price: number;
  showInMenu: boolean;
  productSam: ProductDto;
  productCac: ProductDto;
  productSalon: ProductDto;
  createdAt: string;
  updatedAt: string;
}
