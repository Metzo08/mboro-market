import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  IsBoolean,
  Length,
} from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  shopId: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsIn(['FR', 'WO', 'EN'])
  language?: string;
}

export class SendMessageDto {
  @IsString()
  @Length(1, 4000)
  content: string;

  @IsOptional()
  @IsIn(['FR', 'WO', 'EN'])
  language?: string;

  @IsOptional()
  @IsString()
  role?: string;
}