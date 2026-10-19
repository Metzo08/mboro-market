export class LoginDto {
  phone: string;
}

export class VerifyOtpDto {
  phone: string;
  code: string;
}

export class RegisterDto {
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'customer' | 'merchant';
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
