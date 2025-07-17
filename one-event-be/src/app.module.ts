import { Module, NestModule, MiddlewareConsumer, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventModule } from './modules/event/event.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { PublicModule } from './public/public.module';
import { CommonModule } from './common/common.module';
import { getDatabaseConfig } from './config/database.config';
import { getThrottlerConfig } from './config/throttler.config';
import { CorsMiddleware } from './middlewares/cors.middleware';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
    ThrottlerModule.forRoot(getThrottlerConfig()),
    AuthModule,
    UsersModule,
    EventModule,
    RegistrationModule,
    PublicModule,
    CommonModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    console.log('🔄 Initializing database tables...');
    try {
      if (this.dataSource.isInitialized) {
        console.log('✅ Database connection is active');

        // Force synchronize to create tables
        await this.dataSource.synchronize(false);
        console.log('✅ Database tables synchronized successfully');
      }
    } catch (error) {
      console.error('❌ Database initialization error:', error);
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
