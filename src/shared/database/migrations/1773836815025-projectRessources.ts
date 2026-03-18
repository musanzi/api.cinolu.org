import { MigrationInterface, QueryRunner } from "typeorm";

export class ProjectRessources1773836815025 implements MigrationInterface {
    name = 'ProjectRessources1773836815025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`resource\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`file\` varchar(255) NOT NULL, \`category\` enum ('guide', 'template', 'legal', 'pitch', 'financial', 'report', 'other') NOT NULL, \`projectId\` uuid NULL, \`phaseId\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`resource\` ADD CONSTRAINT \`FK_ba509a0a92e7d2778e75416e756\` FOREIGN KEY (\`projectId\`) REFERENCES \`project\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`resource\` ADD CONSTRAINT \`FK_452eccdc36bc855df2dd1e1e3f6\` FOREIGN KEY (\`phaseId\`) REFERENCES \`phase\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`resource\` DROP FOREIGN KEY \`FK_452eccdc36bc855df2dd1e1e3f6\``);
        await queryRunner.query(`ALTER TABLE \`resource\` DROP FOREIGN KEY \`FK_ba509a0a92e7d2778e75416e756\``);
        await queryRunner.query(`DROP TABLE \`resource\``);
    }

}
