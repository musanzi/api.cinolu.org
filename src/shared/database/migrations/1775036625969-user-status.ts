import { MigrationInterface, QueryRunner } from "typeorm";

export class UserStatus1775036625969 implements MigrationInterface {
    name = 'UserStatus1775036625969'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`status\` enum ('entrepreneur', 'investor', 'partner', 'other') NOT NULL DEFAULT 'other'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`status\``);
    }

}
