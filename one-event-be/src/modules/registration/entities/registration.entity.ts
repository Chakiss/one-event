import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Event } from '../../event/entities/event.entity';

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show',
}

@Entity('registrations')
@Unique(['guestEmail', 'eventId']) // Allow duplicate userId for different events
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId?: string;

  @Column()
  eventId: string;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo?: Record<string, any>;

  // Custom Registration Data
  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, any>; // Store custom field responses

  // Contact Information (for public registrations)
  @Column({ nullable: true })
  guestName?: string;

  @Column({ nullable: true })
  guestEmail?: string;

  @Column({ nullable: true })
  guestPhone?: string;

  // Email Tracking
  @Column({ type: 'timestamp', nullable: true })
  emailOpenedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  emailClickedAt?: Date;

  @Column({ type: 'varchar', nullable: true })
  registrationSource?: string; // 'direct', 'email_campaign', 'social_media', etc.

  @Column({ type: 'varchar', nullable: true })
  utmSource?: string;

  @Column({ type: 'varchar', nullable: true })
  utmMedium?: string;

  @Column({ type: 'varchar', nullable: true })
  utmCampaign?: string;

  @Column({ type: 'timestamp', nullable: true })
  registeredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  attendedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    nullable: true, // Allow null for guest registrations
  })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => Event, (event) => event.registrations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'eventId' })
  event: Event;
}
