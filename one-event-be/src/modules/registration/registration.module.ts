import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { PublicRegistrationController } from './public-registration.controller';
import { Registration } from './entities/registration.entity';
import { EventModule } from '../event/event.module';
import { CommonModule } from '../../common/common.module';
import { EmailModule } from '../../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Registration]),
    EventModule,
    CommonModule,
    EmailModule,
  ],
  controllers: [RegistrationController, PublicRegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
