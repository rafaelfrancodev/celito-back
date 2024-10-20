import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {UserModule} from "./user/user.module";
import {AuthModule} from "./auth/auth.module";
import AppDataSource from "./config/typeorm.config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => AppDataSource.options,
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
