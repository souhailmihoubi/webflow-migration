import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Veuillez entrer une adresse email valide' })
  email?: string;

  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'Le sujet est requis' })
  @IsString()
  @MinLength(3, { message: 'Le sujet doit contenir au moins 3 caractères' })
  subject: string;

  @IsNotEmpty({ message: 'Le message est requis' })
  @IsString()
  @MinLength(10, { message: 'Le message doit contenir au moins 10 caractères' })
  message: string;
}
