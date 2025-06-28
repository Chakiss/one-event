import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistrationDto } from './create-registration.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { RegistrationStatus } from '../entities/registration.entity';

export class UpdateRegistrationDto extends PartialType(CreateRegistrationDto) {
  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus;
}
