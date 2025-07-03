import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsUrl,
  IsObject,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { EventType, EventStatus } from '../entities/event.entity';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsEnum(EventType)
  type: EventType;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus = EventStatus.DRAFT;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsNumber()
  @Min(1)
  maxAttendees: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number = 0;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsOptional()
  agenda?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  registrationDeadline?: string;

  @IsObject()
  @IsOptional()
  registrationFields?: any;

  @IsObject()
  @IsOptional()
  emailCampaignConfig?: any;
}
