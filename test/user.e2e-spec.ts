import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UserController (e2e)', () => {
	let app: INestApplication;
	let adminToken: string;
	let userToken: string;
	let userNameGuid: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		const adminLogin = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				username: 'admin',
				password: 'admin',
			});

		adminToken = adminLogin.body.access_token;

		const userLogin = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				username: 'user',
				password: 'user',
			});

		userToken = userLogin.body.access_token;
	});

	beforeEach(async () => {
		userNameGuid = Math.random().toString(36);
	});

	afterAll(async () => {
		await app.close();
	});

	describe('/users (POST)', () => {
		it('should create a new user (admin only)', async () => {
			
			const response = await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: userNameGuid,
					password: 'password',
					role: 'user',
				})
				.expect(201);

			expect(response.body.username).toEqual(userNameGuid);
			expect(response.body.role).toEqual('user');
		});

		it('should not allow duplicate usernames', async () => {
			
			await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: userNameGuid,
					password: 'password',
					role: 'user',
				})
				.expect(201);

			await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: userNameGuid,
					password: 'password',
					role: 'user',
				})
				.expect(409);
		});

		it('should not allow user to create another user', async () => {
			await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${userToken}`)
				.send({
					username: 'anotheruser',
					password: 'password',
					role: 'user',
				})
				.expect(403);
		});
	});

	describe('/users (GET)', () => {
		it('should list all users (admin only)', async () => {
			await request(app.getHttpServer())
				.get('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.query({ page: 1, pageSize: 10 })
				.expect(200);
		});

		it('should not allow user to list all users', async () => {
			await request(app.getHttpServer())
				.get('/users')
				.set('Authorization', `Bearer ${userToken}`)
				.expect(403);
		});
	});

	describe('/users/:id (GET)', () => {
		it('should allow admin to get any user by ID', async () => {
			
			const createResponse = await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: userNameGuid,
					password: 'password',
					role: 'user',
				})
				.expect(201);

			const userId = createResponse.body.id;

			await request(app.getHttpServer())
				.get(`/users/${userId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200);
		});

		it('should allow user to get their own data', async () => {

			const createResponse = await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: userNameGuid,
					password: 'password',
					role: 'user',
				});

			const userLogin = await request(app.getHttpServer())
				.post('/auth/login')
				.send({
					username: userNameGuid,
					password: 'password',
				});

			const token = userLogin.body.access_token;

			const response = await request(app.getHttpServer())
				.get(`/users/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${token}`)
				.expect(200);

			const userNameGuidAdmin = Math.random().toString(36);
			const adminResponse = await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: userNameGuidAdmin,
					password: 'password',
					role: 'user',
				});

			adminResponse.body.id;

			await request(app.getHttpServer())
				.get(`/users/${adminResponse.body.id}`)
				.set('Authorization', `Bearer ${userToken}`)
				.expect(403);

			expect(response.body.username).toEqual(userNameGuid);
		});

		it('should not allow user to get another user\'s data', async () => {
			await request(app.getHttpServer())
				.get('/users/2')
				.set('Authorization', `Bearer ${userToken}`)
				.expect(403);
		});
	});

	describe('/users/:id (PATCH)', () => {
		it('should allow admin to update any user', async () => {
			
			const createResponse = await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: userNameGuid,
					password: 'password',
					role: 'user',
				})
				.expect(201);

			const userId = createResponse.body.id;

			const response = await request(app.getHttpServer())
				.patch(`/users/${userId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: userNameGuid,
				})
				.expect(200);

			expect(response.body.username).toBe(userNameGuid);
		});

		it('should allow user to update only their own data', async () => {

			const createResponse = await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: userNameGuid,
					password: 'password',
					role: 'user',
				});

			const userLogin = await request(app.getHttpServer())
				.post('/auth/login')
				.send({
					username: userNameGuid,
					password: 'password',
				});

			const token = userLogin.body.access_token;
			const newUserNameGuid = Math.random().toString(36);

			const userNameGuidAdmin = Math.random().toString(36);
			const adminResponse = await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: userNameGuidAdmin,
					password: 'password',
					role: 'user',
				});

			await request(app.getHttpServer())
				.patch(`/users/${adminResponse.body.id}`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					username: newUserNameGuid,
				})
				.expect(403);

			const response = await request(app.getHttpServer())
				.patch(`/users/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					username: newUserNameGuid,
				})
				.expect(200);

			expect(response.body.username).toBe(newUserNameGuid);
		});

		it('should not allow updating to an existing username', async () => {
			const createResponseFirst = await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: userNameGuid,
					password: 'password',
					role: 'user',
				});

			const newUserNameGuid = Math.random().toString(36);
			const createResponseSecond = await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: newUserNameGuid,
					password: 'password',
					role: 'user',
				});

			await request(app.getHttpServer())
				.patch(`/users/${createResponseFirst.body.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: newUserNameGuid,
				})
				.expect(409);
		});
	});

	describe('/users/:id (DELETE)', () => {
		it('should allow admin to delete any user', async () => {
			const createResponse = await request(app.getHttpServer())
				.post('/users')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					username: 'deleteuser',
					password: 'password',
					role: 'user',
				})
				.expect(201);

			const userId = createResponse.body.id;

			await request(app.getHttpServer())
				.delete(`/users/${userId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200);
		});

		it('should not allow user to delete another user', async () => {
			await request(app.getHttpServer())
				.delete('/users/2')
				.set('Authorization', `Bearer ${userToken}`)
				.expect(403); // Corrigido de 401 para 403
		});
	});
});
