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

  @IsEmail()
  email!: string;

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
