import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthStrategy } from './auth.strategy';
import {UserModule} from "../user/user.module";
import {AuthController} from "./auth.controller";


@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: '1eedf8c0-1cc1-4ce0-aaaf-533ae0dea395',
            signOptions: { expiresIn: '1h' },
        }),
        UserModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthStrategy],
    exports: [AuthService],
})
export class AuthModule {}
