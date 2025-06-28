import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { RegistrationStatus } from '../entities/registration.entity';

export class RegistrationFilterDto {
  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
