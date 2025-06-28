import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsUUID,
} from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsObject()
  @IsOptional()
  additionalInfo?: Record<string, any>;
}
