import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  IsEnum,
  Length,
} from 'class-validator';

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export class CreateNotificationDto {
  @IsOptional()
  @IsUUID()
  recipientId?: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  template?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  subject?: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  content?: string;
}