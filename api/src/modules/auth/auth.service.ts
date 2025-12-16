import { Injectable, UnauthorizedException,BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateUserSchema } from '../users/schemas/create-user.schema';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}


    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    private async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByLogin(loginDto.login);

        if (!user) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }


        const isValid = await this.comparePassword(loginDto.password, user.password);

        if (!isValid) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }
        const payload = {
            login: user.login,
            sub: user.id_user,
            role: user.role
        };
        const token = this.jwtService.sign(payload);
        return {
            access_token: token,
            user: {
                id: user.id_user,
                login: user.login,
                name: user.name,
                role: user.role
            }
        };
    }

    async register(registerDto: RegisterDto) {
        console.log('REGISTER DTO:', registerDto);
        const { error } = CreateUserSchema.validate(registerDto);
        if (error) {
            throw new BadRequestException(error.details[0].message);
        }
        const hashedPassword = await this.hashPassword(registerDto.password);
        console.log('HASHED PASSWORD:', hashedPassword);
        const createUserDto = {
            ...registerDto,
            password: hashedPassword,
            role: registerDto.role || 'user',
        };
        console.log('CREATE USER DTO:', createUserDto);

        const user = await this.usersService.create(createUserDto);
        console.log('CREATED USER FROM DB:', user);

        if (!user) {
            throw new BadRequestException('Не удалось создать пользователя');
        }

        return this.login({
            login: registerDto.login,
            password: registerDto.password,
        });
    }
    async getProfile(userId: number) {
        return this.usersService.findById(userId);
    }
}