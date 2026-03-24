import { MigrationInterface, QueryRunner } from 'typeorm';

export class ParticipationReview1774343949381 implements MigrationInterface {
  name = 'ParticipationReview1774343949381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`project_participation\` ADD \`status\` enum ('pending', 'in_review', 'qualified', 'disqualified', 'info_requested') NOT NULL DEFAULT 'pending'`
    );
    await queryRunner.query(`ALTER TABLE \`project_participation\` ADD \`review_message\` text NULL`);
    await queryRunner.query(`ALTER TABLE \`project_participation\` ADD \`reviewed_at\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`project_participation\` ADD \`reviewedById\` uuid NULL`);
    await queryRunner.query(
      `ALTER TABLE \`project_participation\` ADD CONSTRAINT \`FK_eb97ab6335894371c338c940bc9\` FOREIGN KEY (\`reviewedById\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`project_participation\` DROP FOREIGN KEY \`FK_eb97ab6335894371c338c940bc9\``
    );
    await queryRunner.query(`ALTER TABLE \`project_participation\` DROP COLUMN \`reviewedById\``);
    await queryRunner.query(`ALTER TABLE \`project_participation\` DROP COLUMN \`reviewed_at\``);
    await queryRunner.query(`ALTER TABLE \`project_participation\` DROP COLUMN \`review_message\``);
    await queryRunner.query(`ALTER TABLE \`project_participation\` DROP COLUMN \`status\``);
  }
}
