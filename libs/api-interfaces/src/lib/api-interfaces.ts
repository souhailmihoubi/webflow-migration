import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  name!: string;
  slug!: string;
  image?: string;
  showInHomePage?: boolean;
}

export class UpdateCategoryDto {
  name?: string;
  slug?: string;
  image?: string;
  showInHomePage?: boolean;
}

// Product DTOs
export class CreateProductDto {
  name!: string;
  slug!: string;
  mainImage!: string;
  multiImages?: string[];
  priceDetails?: string;
  productDescription!: string;
  caracteristiques?: string;
  price!: number;
  discountPrice?: number;
  showInMenu?: boolean;
  videoLink?: string;
  categoryId!: string;
}

export class UpdateProductDto {
  name?: string;
  slug?: string;
  mainImage?: string;
  multiImages?: string[];
  priceDetails?: string;
  productDescription?: string;
  caracteristiques?: string;
  price?: number;
  discountPrice?: number;
  showInMenu?: boolean;
  videoLink?: string;
  categoryId?: string;
}

// Cart & Order DTOs
export class AddToCartDto {
  productId!: string;
  quantity!: number;
}

export class UpdateCartItemDto {
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
  name!: string;
  slug!: string;
  description?: string;
  mainImage?: string;
  productSamId!: string;
  productCacId!: string;
  productSalonId!: string;
  discountPercentage?: number;
  showInMenu?: boolean;
}

export class UpdatePackDto {
  name?: string;
  description?: string;
  mainImage?: string;
  productSamId?: string;
  productCacId?: string;
  productSalonId?: string;
  discountPercentage?: number;
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
