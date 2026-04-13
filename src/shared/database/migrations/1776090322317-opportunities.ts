import { MigrationInterface, QueryRunner } from "typeorm";

export class Opportunities1776090322317 implements MigrationInterface {
    name = 'Opportunities1776090322317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`opportunity\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`title\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`description\` longtext NOT NULL, \`cover\` varchar(255) NULL, \`due_date\` date NOT NULL, \`link\` varchar(255) NOT NULL, \`language\` enum ('fr', 'en') NOT NULL, UNIQUE INDEX \`IDX_582be9863b2e5b18f4f5ac6373\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_582be9863b2e5b18f4f5ac6373\` ON \`opportunity\``);
        await queryRunner.query(`DROP TABLE \`opportunity\``);
    }

}
