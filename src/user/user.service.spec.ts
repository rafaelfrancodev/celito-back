
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from "./user.service";

describe('UserService', () => {
	let userService: UserService;
	let mockUserRepository: any;

	beforeEach(() => {
		mockUserRepository = {
			findOne: jest.fn(),
			create: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				getCount: jest.fn().mockReturnThis(),
				skip: jest.fn().mockReturnThis(),
				take: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
			})),
		};

		userService = new UserService(mockUserRepository);
	});

	describe('createUser', () => {
		it('should successfully create a user', async () => {
			const username = 'john';
			const password = 'password';
			const role = 'user';

			mockUserRepository.findOne.mockResolvedValue(null);
			mockUserRepository.create.mockReturnValue({ username, password, role });
			mockUserRepository.save.mockResolvedValue({ id: 1, username, role });

			jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

			const result = await userService.createUser(username, password, role);

			expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username } });
			expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
			expect(mockUserRepository.create).toHaveBeenCalledWith({ username, password: 'hashedPassword', role });
			expect(mockUserRepository.save).toHaveBeenCalled();
			expect(result).toEqual({ id: 1, username, role });
		});

		it('should throw a ConflictException if the username already exists', async () => {
			mockUserRepository.findOne.mockResolvedValue({ id: 1, username: 'john' });

			await expect(userService.createUser('john', 'password', 'user')).rejects.toThrow(ConflictException);
		});
	});

	describe('findOneById', () => {
		it('should return the user if found', async () => {
			const mockUser = { id: 1, username: 'john', role: 'user' };
			mockUserRepository.findOne.mockResolvedValue(mockUser);

			const result = await userService.findOneById(1);

			expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
			expect(result).toEqual(mockUser);
		});

		it('should throw a NotFoundException if the user is not found', async () => {
			mockUserRepository.findOne.mockResolvedValue(null);

			await expect(userService.findOneById(1)).rejects.toThrow(NotFoundException);
		});
	});

	describe('findOneByUsername', () => {
		it('should return the user if found', async () => {
			const mockUser = { id: 1, username: 'john', role: 'user' };
			mockUserRepository.findOne.mockResolvedValue(mockUser);

			const result = await userService.findOneByUsername('john');

			expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: 'john' } });
			expect(result).toEqual(mockUser);
		});

		it('should throw a NotFoundException if the user is not found', async () => {
			mockUserRepository.findOne.mockResolvedValue(null);

			await expect(userService.findOneByUsername('john')).rejects.toThrow(NotFoundException);
		});
	});

	describe('updateUser', () => {
		it('should update the user successfully', async () => {
			const mockUser = { id: 1, username: 'john', role: 'user' };
			const updatedData = { username: 'john_updated' };

			mockUserRepository.findOne.mockResolvedValue(mockUser);
			mockUserRepository.save.mockResolvedValue({ ...mockUser, ...updatedData });

			const result = await userService.updateUser(1, updatedData);

			expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
			expect(mockUserRepository.save).toHaveBeenCalledWith({ ...mockUser, ...updatedData });
			expect(result).toEqual({ ...mockUser, ...updatedData });
		});

		it('should throw ConflictException if username is taken', async () => {
			mockUserRepository.findOne.mockResolvedValueOnce({ id: 1, username: 'john' });
			mockUserRepository.findOne.mockResolvedValueOnce({ id: 2, username: 'john_updated' });

			const updatedData = { username: 'john_updated' };
			await expect(userService.updateUser(1, updatedData)).rejects.toThrow(ConflictException);
		});
	});

	describe('deleteUser', () => {
		it('should delete a user successfully', async () => {
			mockUserRepository.delete.mockResolvedValue({ affected: 1 });

			await userService.deleteUser(1);

			expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
		});

		it('should throw NotFoundException if user does not exist', async () => {
			mockUserRepository.delete.mockResolvedValue({ affected: 0 });

			await expect(userService.deleteUser(1)).rejects.toThrow(NotFoundException);
		});
	});

	describe('findAllPaginated', () => {
		it('should return paginated results', async () => {
			const mockUsers = [
				{ id: 1, username: 'john', role: 'user' },
				{ id: 2, username: 'jane', role: 'admin' },
			];

			const mockQueryBuilder = {
				andWhere: jest.fn().mockReturnThis(),
				skip: jest.fn().mockReturnThis(),
				take: jest.fn().mockReturnThis(),
				getCount: jest.fn().mockResolvedValue(2),
				getMany: jest.fn().mockResolvedValue(mockUsers),
			};

			mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const options = { username: '', role: '', page: 1, pageSize: 10 };
			const result = await userService.findAllPaginated(options);

			expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();

			expect(result).toEqual({
				data: mockUsers,
				page: 1,
				pageSize: 10,
				hasNextPage: false,
			});
		});


		it('should apply username and role filters', async () => {
			const mockUsers = [{ id: 1, username: 'john', role: 'user' }];

			const mockQueryBuilder = {
				andWhere: jest.fn().mockReturnThis(),
				skip: jest.fn().mockReturnThis(),
				take: jest.fn().mockReturnThis(),
				getCount: jest.fn().mockResolvedValue(1),
				getMany: jest.fn().mockResolvedValue(mockUsers),
			};

			mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

			const options = { username: 'john', role: 'user', page: 1, pageSize: 10 };
			const result = await userService.findAllPaginated(options);

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.username LIKE :username', { username: '%john%' });
			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', { role: 'user' });

			expect(result).toEqual({
				data: mockUsers,
				page: 1,
				pageSize: 10,
				hasNextPage: false,
			});
		});
	});
});
