import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from "class-transformer";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Exclude()
    @Column()
    password: string;

    @Column()
    role: string; // 'admin' or 'user'
}
