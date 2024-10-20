import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async createUser(username: string, password: string, role: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.userRepository.create({ username, password: hashedPassword, role });
        return this.userRepository.save(newUser);
    }

    async findOneById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findOneByUsername(username: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException(`User with username ${username} not found`);
        }
        return user;
    }

    async updateUser(id: number, updateData: Partial<User>): Promise<User> {
        const user = await this.findOneById(id);
        Object.assign(user, updateData);
        return this.userRepository.save(user);
    }

    async deleteUser(id: number): Promise<void> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }
}
