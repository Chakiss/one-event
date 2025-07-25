import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { EventStatus } from '../entities/event.entity';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}
