import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}


    @Post('login')
    @ApiOperation({ summary: 'Login with username and password' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
