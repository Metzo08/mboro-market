import {
  IsPhoneNumber,
  IsOptional,
  IsEmail,
  IsIn,
  IsString,
  Length,
} from 'class-validator';
export class LoginDto {
  @IsString()
  @Length(8, 20)
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  @Length(8, 20)
  phone: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class RegisterDto {
  @IsString()
  @Length(8, 20)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(8, 128)
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsIn(['CUSTOMER', 'MERCHANT', 'customer', 'merchant'])
  role?: 'customer' | 'merchant' | 'CUSTOMER' | 'MERCHANT';
}

export class ChangePasswordDto {
  @IsString()
  @Length(8, 128)
  currentPassword: string;

  @IsString()
  @Length(8, 128)
  newPassword: string;
}

export class LoginWithEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 128)
  password: string;
}
