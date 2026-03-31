import { MigrationInterface, QueryRunner } from "typeorm";

export class AiCoach1774946623920 implements MigrationInterface {
    name = 'AiCoach1774946623920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`ai_coach\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`name\` varchar(255) NOT NULL, \`profile\` text NOT NULL, \`role\` text NOT NULL, \`expected_outputs\` text NOT NULL, \`model\` varchar(255) NOT NULL DEFAULT 'llama3.2:3b', \`status\` varchar(255) NOT NULL DEFAULT 'active', \`ventureId\` uuid NOT NULL, UNIQUE INDEX \`REL_c00d38364da925902d89db8ad5\` (\`ventureId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`coach_conversation\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`status\` varchar(255) NOT NULL DEFAULT 'active', \`coachId\` uuid NOT NULL, \`ventureId\` uuid NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`coach_message\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`role\` varchar(255) NOT NULL, \`output_type\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`payload\` text NOT NULL, \`conversationId\` uuid NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`status\` enum ('entrepreneur', 'investor', 'mentor', 'partner', 'other') NOT NULL DEFAULT 'other'`);
        await queryRunner.query(`ALTER TABLE \`ai_coach\` ADD CONSTRAINT \`FK_c00d38364da925902d89db8ad58\` FOREIGN KEY (\`ventureId\`) REFERENCES \`venture\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`coach_conversation\` ADD CONSTRAINT \`FK_0002eee2945d9e6b8cefa3f4d99\` FOREIGN KEY (\`coachId\`) REFERENCES \`ai_coach\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`coach_conversation\` ADD CONSTRAINT \`FK_30f7e35a877120214526dc59503\` FOREIGN KEY (\`ventureId\`) REFERENCES \`venture\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`coach_message\` ADD CONSTRAINT \`FK_10d49b902a6b3f33382f0cac9d8\` FOREIGN KEY (\`conversationId\`) REFERENCES \`coach_conversation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`coach_message\` DROP FOREIGN KEY \`FK_10d49b902a6b3f33382f0cac9d8\``);
        await queryRunner.query(`ALTER TABLE \`coach_conversation\` DROP FOREIGN KEY \`FK_30f7e35a877120214526dc59503\``);
        await queryRunner.query(`ALTER TABLE \`coach_conversation\` DROP FOREIGN KEY \`FK_0002eee2945d9e6b8cefa3f4d99\``);
        await queryRunner.query(`ALTER TABLE \`ai_coach\` DROP FOREIGN KEY \`FK_c00d38364da925902d89db8ad58\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`status\``);
        await queryRunner.query(`DROP TABLE \`coach_message\``);
        await queryRunner.query(`DROP TABLE \`coach_conversation\``);
        await queryRunner.query(`DROP INDEX \`REL_c00d38364da925902d89db8ad5\` ON \`ai_coach\``);
        await queryRunner.query(`DROP TABLE \`ai_coach\``);
    }

}
