import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcryptjs';

export class AddAdminSeed1729450357585 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const adminUser = await queryRunner.query(
            `SELECT * FROM "user" WHERE username = $1`,
            ['admin']
        );

        if (adminUser.length === 0) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            await queryRunner.query(
                `INSERT INTO "user" (username, password, role) VALUES ($1, $2, $3)`,
                ['admin', hashedPassword, 'admin']
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "user" WHERE username = $1`,
            ['admin']
        );
    }

}
