import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    second_name: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    last_name?: string;

    @IsString()
    @IsNotEmpty()
    login: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsOptional()
    role?: string;
}