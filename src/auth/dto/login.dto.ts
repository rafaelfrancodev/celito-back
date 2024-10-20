import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'john_doe', description: 'The username of the user' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: '123456', description: 'The password of the user' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
