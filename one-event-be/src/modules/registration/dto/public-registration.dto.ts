import {
  IsEmail,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
} from 'class-validator';

export class PublicRegistrationDto {
  @IsOptional()
  @IsUUID()
  userId?: string; // For authenticated users

  // Guest registration fields
  @IsOptional()
  @IsString()
  guestName?: string;

  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @IsOptional()
  @IsString()
  guestPhone?: string;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @IsOptional()
  @IsString()
  registrationSource?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
