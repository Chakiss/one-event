import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegistrationFieldDto {
  @IsString()
  id: string;

  @IsString()
  type:
    | 'text'
    | 'email'
    | 'phone'
    | 'select'
    | 'multiselect'
    | 'textarea'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'number';

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };

  @IsOptional()
  order: number;

  @IsBoolean()
  visible: boolean;
}

export class UpdateRegistrationFieldsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistrationFieldDto)
  fields: RegistrationFieldDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionalFields?: string[];
}
