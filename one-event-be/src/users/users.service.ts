import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'role', 'createdAt', 'updatedAt'], // ไม่ส่ง password
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'role', 'createdAt', 'updatedAt'], // ไม่ส่ง password
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<User | null> {
    const selectFields = ['id', 'email', 'role', 'createdAt', 'updatedAt'];
    if (includePassword) {
      selectFields.push('password');
    }

    return this.userRepository.findOne({
      where: { email },
      select: selectFields as any,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      console.log('UsersService.create called with:', {
        ...createUserDto,
        password: '[HIDDEN]',
      });

      // ตรวจสอบว่า email ซ้ำหรือไม่
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        console.log('Email already exists:', createUserDto.email);
        throw new ConflictException('Email already exists');
      }

      console.log('Creating new user...');
      const user = this.userRepository.create(createUserDto);
      console.log('User entity created, saving to database...');
      const savedUser = await this.userRepository.save(user);
      console.log('User saved successfully:', {
        id: savedUser.id,
        email: savedUser.email,
      });

      // ส่งกลับโดยไม่มี password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = savedUser;
      return result as User;
    } catch (error) {
      console.error('Error in UsersService.create:', error);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // ตรวจสอบว่ามี user อยู่จริง

    // ถ้าต้องการเปลี่ยน email ต้องตรวจสอบว่าไม่ซ้ำ
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id); // ตรวจสอบว่ามี user อยู่จริง
    await this.userRepository.remove(user);
  }

  // Method สำหรับ authentication
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email, true); // รวม password
    if (user && (await user.validatePassword(password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result as User;
    }
    return null;
  }

  // Email verification methods
  async findByVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });
  }

  async markEmailAsVerified(id: string): Promise<void> {
    await this.userRepository.update(id, {
      isEmailVerified: true,
      emailVerificationToken: undefined,
    });
  }

  async updateVerificationToken(email: string, token: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(user.id, {
      emailVerificationToken: token,
    });
  }
}
