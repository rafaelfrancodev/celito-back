import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { instanceToPlain } from "class-transformer";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userService.findOneByUsername(username);
        if (user && (await bcrypt.compare(password, user.password))) {
            return instanceToPlain(user);
        }
        throw new UnauthorizedException('Invalid credentials');
    }

    async login(loginDto: LoginDto) {
        const { username, password } = loginDto;
        const user = await this.validateUser(username, password);
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            token_type: 'Bearer',
            expires_in: 3600,
        };
    }
}
