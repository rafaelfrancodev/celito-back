import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import {
	IUsersFindAllPaginatedOptions
} from "./interfaces/users-find-all-paginated-options.interface";
import { IPaginatedResult } from "../common/paginated-result.interface";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {
	}

	async createUser(username: string, password: string, role: string): Promise<User> {

		const user = await this.userRepository.findOne({where: {username}});
		if (user) {
			throw new ConflictException(`User ${username} already exists.`);
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = this.userRepository.create({username, password: hashedPassword, role});
		return this.userRepository.save(newUser);
	}

	async findOneById(id: number): Promise<User> {
		const user = await this.userRepository.findOne({where: {id}});
		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
		return user;
	}

	async findOneByUsername(username: string): Promise<User> {
		const user = await this.userRepository.findOne({where: {username}});
		if (!user) {
			throw new NotFoundException(`User with username ${username} not found`);
		}
		return user;
	}

	async updateUser(id: number, updateData: Partial<User>): Promise<User> {
		const user = await this.findOneById(id);

		if (updateData.username && updateData.username !== user.username) {
			const existingUser = await this.userRepository.findOne({
				where: {username: updateData.username},
			});

			if (existingUser && existingUser.id !== id) {
				throw new ConflictException('Username already taken');
			}
		}

		Object.assign(user, updateData);
		return this.userRepository.save(user);
	}

	async deleteUser(id: number): Promise<void> {
		const result = await this.userRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
	}

	async findAllPaginated(options: IUsersFindAllPaginatedOptions): Promise<IPaginatedResult<User>> {
		const {username, role, page, pageSize} = options;

		const queryBuilder = this.userRepository.createQueryBuilder('user');

		if (username) {
			queryBuilder.andWhere('user.username LIKE :username', {username: `%${username}%`});
		}

		if (role) {
			queryBuilder.andWhere('user.role = :role', {role});
		}

		const totalCount = await queryBuilder.getCount();
		const users = await queryBuilder
			.skip((page - 1) * pageSize)
			.take(pageSize)
			.getMany();

		const hasNextPage = (page * pageSize) < totalCount;

		return {
			data: users,
			page,
			pageSize,
			hasNextPage,
		};
	}
}
