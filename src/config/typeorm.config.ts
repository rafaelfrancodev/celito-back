import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot();
const configService = new ConfigService();

const AppDataSource = new DataSource({
	type: 'postgres',
	host: configService.get<string>('POSTGRES_HOST'),
	port: configService.get<number>('POSTGRES_PORT'),
	username: configService.get<string>('POSTGRES_USER'),
	password: configService.get<string>('POSTGRES_PASSWORD'),
	database: configService.get<string>('POSTGRES_DB'),
	entities: [User],
	migrations: [__dirname + '/../migrations/*.ts'],
	synchronize: false,
});

export default AppDataSource;
