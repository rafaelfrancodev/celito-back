import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    async createUser(@Body() createUserDto: CreateUserDto) {
        const { username, password, role } = createUserDto;
        return this.userService.createUser(username, password, role);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get()
    @ApiOperation({ summary: 'List all users' })
    async getAllUsers() {
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    async getUser(@Param('id') id: number) {
        return this.userService.findOneById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id')
    @ApiOperation({ summary: 'Update a user' })
    async updateUser(@Param('id') id: number, @Body() updateUserDto: CreateUserDto) {  // Optionally, you can use this for updates too
        return this.userService.updateUser(id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    async deleteUser(@Param('id') id: number) {
        return this.userService.deleteUser(id);
    }
}
