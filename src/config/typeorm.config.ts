import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 15432,
    username: 'postgres',
    password: 'Postgres2022!',
    database: 'postgres',
    entities: [User],
    migrations: [__dirname + '/../migrations/*.ts'],
    synchronize: false,
});

export default AppDataSource;
