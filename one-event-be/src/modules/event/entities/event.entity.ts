import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Registration } from '../../registration/entities/registration.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum EventType {
  CONFERENCE = 'conference',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  MEETUP = 'meetup',
  WEBINAR = 'webinar',
  NETWORKING = 'networking',
  OTHER = 'other',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.OTHER,
  })
  type: EventType;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column()
  location: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'int' })
  maxAttendees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'text', nullable: true })
  agenda: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  registrationDeadline: Date;

  // Landing Page Customization Fields
  @Column({ type: 'text', nullable: true })
  landingPageHtml: string;

  @Column({ type: 'json', nullable: true })
  landingPageConfig: {
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
      fontFamily?: string;
    };
    hero?: {
      title?: string;
      subtitle?: string;
      backgroundImage?: string;
      backgroundVideo?: string;
      ctaText?: string;
      ctaColor?: string;
    };
    sections?: {
      showAbout?: boolean;
      showAgenda?: boolean;
      showSpeakers?: boolean;
      showLocation?: boolean;
      showPricing?: boolean;
      showTestimonials?: boolean;
      customSections?: Array<{
        title: string;
        content: string;
        type: 'text' | 'image' | 'video' | 'html';
        order: number;
      }>;
    };
    contact?: {
      email?: string;
      phone?: string;
      website?: string;
      socialMedia?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
      };
    };
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
      ogImage?: string;
    };
  };

  @Column({ type: 'text', nullable: true })
  customCss: string;

  @Column({ type: 'text', nullable: true })
  customJs: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  slug: string; // URL-friendly identifier for the landing page

  // Custom Registration Fields Configuration
  @Column({ type: 'json', nullable: true })
  registrationFields: {
    fields: Array<{
      id: string;
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
      label: string;
      placeholder?: string;
      required: boolean;
      options?: string[]; // For select, multiselect, radio
      validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        min?: number;
        max?: number;
      };
      order: number;
      visible: boolean;
    }>;
    requiredFields: string[]; // Standard fields that are always required
    optionalFields: string[]; // Standard fields that are optional
  };

  // Email Campaign Settings
  @Column({ type: 'json', nullable: true })
  emailCampaignConfig: {
    enabled: boolean;
    templates: {
      invitation?: {
        subject: string;
        htmlContent: string;
        textContent: string;
      };
      confirmation?: {
        subject: string;
        htmlContent: string;
        textContent: string;
      };
      reminder?: {
        subject: string;
        htmlContent: string;
        textContent: string;
        sendDaysBefore: number[];
      };
    };
    trackingEnabled: boolean;
  };

  // Relations
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @Column()
  organizerId: string;

  @OneToMany(() => Registration, (registration) => registration.event)
  registrations: Registration[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual fields
  get isRegistrationOpen(): boolean {
    const now = new Date();
    const deadline = this.registrationDeadline || this.startDate;
    return (
      this.status === EventStatus.PUBLISHED &&
      now < deadline &&
      now < this.startDate
    );
  }

  get remainingSlots(): number {
    // Will be calculated with registrations count
    return this.maxAttendees;
  }
}
