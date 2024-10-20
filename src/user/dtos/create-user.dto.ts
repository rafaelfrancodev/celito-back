import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import AuthRolesConstants from "../../auth/auth-roles.constants";  // Importing validation decorators

export class CreateUserDto {
    @ApiProperty({ example: 'john_doe', description: 'The username of the user' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: '123456', description: 'The password of the user' })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({ example: 'admin', description: `The role of the user (e.g., ${AuthRolesConstants.ADMIN} or ${AuthRolesConstants.USER})` })
    @IsString()
    @IsIn([AuthRolesConstants.ADMIN, AuthRolesConstants.USER])
    role: string;
}
