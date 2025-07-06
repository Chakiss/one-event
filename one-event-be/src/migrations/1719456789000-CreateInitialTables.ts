import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1719456789000 implements MigrationInterface {
  name = 'CreateInitialTables1719456789000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Create enum types first
    await queryRunner.query(`
      CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'guest', 'manager')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published', 'cancelled', 'completed')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."enum_events_type" AS ENUM('conference', 'workshop', 'seminar', 'meetup', 'webinar', 'networking', 'other')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."enum_registrations_status" AS ENUM('pending', 'confirmed', 'cancelled', 'attended', 'no_show')
    `);
    
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "company" character varying,
        "position" character varying,
        "phone" character varying,
        "department" character varying,
        "role" "public"."enum_users_role" NOT NULL DEFAULT 'guest',
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "emailVerificationToken" character varying,
        "passwordResetToken" character varying,
        "passwordResetExpires" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Create events table
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "type" "public"."enum_events_type" NOT NULL DEFAULT 'other',
        "status" "public"."enum_events_status" NOT NULL DEFAULT 'draft',
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "timezone" character varying NOT NULL DEFAULT 'UTC',
        "location" character varying,
        "venue" character varying,
        "address" character varying,
        "maxAttendees" integer,
        "requiresApproval" boolean NOT NULL DEFAULT false,
        "isPublic" boolean NOT NULL DEFAULT true,
        "registrationEnabled" boolean NOT NULL DEFAULT true,
        "registrationDeadline" TIMESTAMP,
        "contactEmail" character varying,
        "contactPhone" character varying,
        "additionalInfo" jsonb,
        "customFields" jsonb,
        "emailTemplates" jsonb,
        "settings" jsonb,
        "organizerId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_40720f2b66e1cd0ca6b1b8d5110" PRIMARY KEY ("id")
      )
    `);

    // Create registrations table
    await queryRunner.query(`
      CREATE TABLE "registrations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "eventId" uuid NOT NULL,
        "status" "public"."enum_registrations_status" NOT NULL DEFAULT 'pending',
        "notes" text,
        "additionalInfo" jsonb,
        "customFields" jsonb,
        "guestName" character varying,
        "guestEmail" character varying,
        "guestPhone" character varying,
        "guestCompany" character varying,
        "guestPosition" character varying,
        "guestDepartment" character varying,
        "registrationDate" TIMESTAMP NOT NULL DEFAULT now(),
        "approvalDate" TIMESTAMP,
        "approvedBy" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_registrations_guest_event" UNIQUE ("guestEmail", "eventId"),
        CONSTRAINT "PK_522c9d0d01854d35e43f8e2a05e" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "events" ADD CONSTRAINT "FK_events_organizer" 
      FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "registrations" ADD CONSTRAINT "FK_registrations_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "registrations" ADD CONSTRAINT "FK_registrations_event" 
      FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "registrations" ADD CONSTRAINT "FK_registrations_approver" 
      FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "registrations" DROP CONSTRAINT "FK_registrations_approver"`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" DROP CONSTRAINT "FK_registrations_event"`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" DROP CONSTRAINT "FK_registrations_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_events_organizer"`,
    );
    
    // Drop tables
    await queryRunner.query(`DROP TABLE "registrations"`);
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TABLE "users"`);
    
    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."enum_registrations_status"`);
    await queryRunner.query(`DROP TYPE "public"."enum_events_type"`);
    await queryRunner.query(`DROP TYPE "public"."enum_events_status"`);
    await queryRunner.query(`DROP TYPE "public"."enum_users_role"`);
  }
}
