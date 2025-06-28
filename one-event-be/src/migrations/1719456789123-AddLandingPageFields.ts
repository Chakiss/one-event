import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLandingPageFields1719456789123 implements MigrationInterface {
  name = 'AddLandingPageFields1719456789123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "events" 
      ADD COLUMN "landingPageHtml" text,
      ADD COLUMN "landingPageConfig" json,
      ADD COLUMN "customCss" text,
      ADD COLUMN "customJs" text,
      ADD COLUMN "slug" varchar(100) UNIQUE
    `);

    // Create index for slug
    await queryRunner.query(`
      CREATE INDEX "IDX_EVENT_SLUG" ON "events" ("slug")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_EVENT_SLUG"`);
    await queryRunner.query(`
      ALTER TABLE "events" 
      DROP COLUMN "landingPageHtml",
      DROP COLUMN "landingPageConfig",
      DROP COLUMN "customCss",
      DROP COLUMN "customJs",
      DROP COLUMN "slug"
    `);
  }
}
