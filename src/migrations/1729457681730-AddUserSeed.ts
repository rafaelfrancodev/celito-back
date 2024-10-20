import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcryptjs';

export class AddUserSeed1729457681730 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const adminUser = await queryRunner.query(
            `SELECT * FROM "user" WHERE username = $1`,
            ['user']
        );

        if (adminUser.length === 0) {
            const hashedPassword = await bcrypt.hash('user', 10);
            await queryRunner.query(
                `INSERT INTO "user" (username, password, role) VALUES ($1, $2, $3)`,
                ['user', hashedPassword, 'user']
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "user" WHERE username = $1`,
            ['user']
        );
    }

}
