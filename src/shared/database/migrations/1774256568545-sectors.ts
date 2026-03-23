import { MigrationInterface, QueryRunner } from "typeorm";

export class Sectors1774256568545 implements MigrationInterface {
    name = 'Sectors1774256568545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`program_sector\` (\`id\` uuid NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`program\` ADD \`sectorId\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`program\` ADD CONSTRAINT \`FK_3f4555e6991ffc44218c711c218\` FOREIGN KEY (\`sectorId\`) REFERENCES \`program_sector\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`program\` DROP FOREIGN KEY \`FK_3f4555e6991ffc44218c711c218\``);
        await queryRunner.query(`ALTER TABLE \`program\` DROP COLUMN \`sectorId\``);
        await queryRunner.query(`DROP TABLE \`program_sector\``);
    }

}
