import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthAuthorizeGuard } from '../auth/auth-authorize.guard';
import { AuthAuthorizationRolesGuard } from '../auth/auth-authorization-roles.guard';
import { AuthRoles } from '../auth/auth-roles.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { instanceToPlain } from "class-transformer";

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthAuthorizeGuard, AuthAuthorizationRolesGuard)
    @AuthRoles('admin')
    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    async createUser(@Body() createUserDto: CreateUserDto) {
        const { username, password, role } = createUserDto;
        const user = this.userService.createUser(username, password, role);
        return instanceToPlain(user);
    }

    @UseGuards(AuthAuthorizeGuard, AuthAuthorizationRolesGuard)
    @AuthRoles('admin')
    @Get()
    @ApiOperation({ summary: 'List all users' })
    async getAllUsers() {
        const users = this.userService.findAll();
        return instanceToPlain(users);
    }

    @UseGuards(AuthAuthorizeGuard, AuthAuthorizationRolesGuard)
    @AuthRoles('admin', 'user')
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    async getUser(@Param('id') id: number) {
        const user = this.userService.findOneById(id);
        return instanceToPlain(user);
    }

    @UseGuards(AuthAuthorizeGuard, AuthAuthorizationRolesGuard)
    @AuthRoles('admin', 'user')
    @Patch(':id')
    @ApiOperation({ summary: 'Update a user' })
    async updateUser(@Param('id') id: number, @Body() updateUserDto: CreateUserDto) {
        const user = this.userService.updateUser(id, updateUserDto);
        return instanceToPlain(user);
    }

    @UseGuards(AuthAuthorizeGuard, AuthAuthorizationRolesGuard)
    @AuthRoles('admin')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    async deleteUser(@Param('id') id: number) {
        return this.userService.deleteUser(id);
    }
}
