import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../common/services/email.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.usersService.validateUser(email, password);
  }

  async login(user: User): Promise<AuthResponse> {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; user: Partial<User> }> {
    try {
      console.log('AuthService.register called with:', registerDto);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Add verification token to user data
      const userWithToken = {
        ...registerDto,
        emailVerificationToken: verificationToken,
        isEmailVerified: false,
      };

      console.log('Creating user with token:', {
        ...userWithToken,
        password: '[HIDDEN]',
      });

      const user = await this.usersService.create(userWithToken);

      console.log('User created successfully:', {
        id: user.id,
        email: user.email,
      });

      // Send verification email
      try {
        await this.emailService.sendVerificationEmail(
          user.email,
          verificationToken,
          user.name,
        );
        console.log(`Verification email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email sending fails
      }

      return {
        message:
          'User registered successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isEmailVerified: user.isEmailVerified,
        },
      };
    } catch (error) {
      console.error('Error in register service:', error);
      throw error;
    }
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    const { token } = verifyEmailDto;

    // Find user by verification token
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user as verified
    await this.usersService.markEmailAsVerified(user.id);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified' };
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Update user with new token
    await this.usersService.updateVerificationToken(email, verificationToken);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.name,
      );
      console.log(`Verification email resent to ${email}`);
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
      throw new BadRequestException('Failed to send verification email');
    }

    return { message: 'Verification email sent successfully' };
  }

  async getProfile(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }
}
