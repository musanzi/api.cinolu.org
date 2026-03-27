import { MigrationInterface, QueryRunner } from "typeorm";

export class ParticipationReview1774608923288 implements MigrationInterface {
    name = 'ParticipationReview1774608923288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`project_participation\` DROP FOREIGN KEY \`FK_eb97ab6335894371c338c940bc9\``);
        await queryRunner.query(`CREATE TABLE \`project_participation_review\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`message\` text NULL, \`score\` int NOT NULL DEFAULT '0', \`participationId\` uuid NULL, \`phaseId\` uuid NULL, \`reviewerId\` uuid NULL, UNIQUE INDEX \`IDX_63049ae90e05beae845e5799ae\` (\`participationId\`, \`phaseId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`project_participation\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`project_participation\` DROP COLUMN \`review_message\``);
        await queryRunner.query(`ALTER TABLE \`project_participation\` DROP COLUMN \`reviewed_at\``);
        await queryRunner.query(`ALTER TABLE \`project_participation\` DROP COLUMN \`reviewedById\``);
        await queryRunner.query(`ALTER TABLE \`project_participation_review\` ADD CONSTRAINT \`FK_24eda18de407252409a6ea395d1\` FOREIGN KEY (\`participationId\`) REFERENCES \`project_participation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_participation_review\` ADD CONSTRAINT \`FK_19da817d9c4383c2f5ac72a7a3c\` FOREIGN KEY (\`phaseId\`) REFERENCES \`phase\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_participation_review\` ADD CONSTRAINT \`FK_fcac3cd91a5ec556adf5808748d\` FOREIGN KEY (\`reviewerId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`project_participation_review\` DROP FOREIGN KEY \`FK_fcac3cd91a5ec556adf5808748d\``);
        await queryRunner.query(`ALTER TABLE \`project_participation_review\` DROP FOREIGN KEY \`FK_19da817d9c4383c2f5ac72a7a3c\``);
        await queryRunner.query(`ALTER TABLE \`project_participation_review\` DROP FOREIGN KEY \`FK_24eda18de407252409a6ea395d1\``);
        await queryRunner.query(`ALTER TABLE \`project_participation\` ADD \`reviewedById\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`project_participation\` ADD \`reviewed_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`project_participation\` ADD \`review_message\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`project_participation\` ADD \`status\` enum ('pending', 'in_review', 'qualified', 'disqualified', 'info_requested') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`DROP INDEX \`IDX_63049ae90e05beae845e5799ae\` ON \`project_participation_review\``);
        await queryRunner.query(`DROP TABLE \`project_participation_review\``);
        await queryRunner.query(`ALTER TABLE \`project_participation\` ADD CONSTRAINT \`FK_eb97ab6335894371c338c940bc9\` FOREIGN KEY (\`reviewedById\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
