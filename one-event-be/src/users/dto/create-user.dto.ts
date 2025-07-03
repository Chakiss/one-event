import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'ชื่อ-นามสกุล', example: 'จอห์น โด' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'อีเมล', example: 'john.doe@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'รหัสผ่าน', minLength: 8 })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'ชื่อบริษัท',
    example: 'ABC Corporation',
    required: false,
  })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({
    description: 'ตำแหน่งงาน',
    example: 'Project Manager',
    required: false,
  })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({
    description: 'หมายเลขโทรศัพท์',
    example: '+66812345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'แผนก/ฝ่าย',
    example: 'IT Department',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    description: 'บทบาท',
    enum: ['admin', 'guest', 'manager'],
    default: 'guest',
  })
  @IsEnum(['admin', 'guest', 'manager'])
  role: 'admin' | 'guest' | 'manager';
}
