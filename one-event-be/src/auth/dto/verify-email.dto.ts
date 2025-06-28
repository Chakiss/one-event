import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'รหัสยืนยันอีเมล',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'อีเมลที่ต้องการส่งรหัสยืนยันใหม่',
    example: 'user@company.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
