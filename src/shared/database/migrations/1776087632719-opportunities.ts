import { MigrationInterface, QueryRunner } from "typeorm";

export class Opportunities1776087632719 implements MigrationInterface {
    name = 'Opportunities1776087632719'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`opportunity\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`title\` varchar(255) NOT NULL, \`description\` longtext NOT NULL, \`cover\` varchar(255) NULL, \`due_date\` date NOT NULL, \`link\` varchar(255) NOT NULL, \`language\` enum ('fr', 'en') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`opportunity\``);
    }

}
