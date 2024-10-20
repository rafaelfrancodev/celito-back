import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';  // Importing validation decorators

export class CreateUserDto {
    @ApiProperty({ example: 'john_doe', description: 'The username of the user' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: '123456', description: 'The password of the user' })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({ example: 'admin', description: 'The role of the user (e.g., admin or user)' })
    @IsString()
    @IsIn(['admin', 'user'])
    role: string;
}
