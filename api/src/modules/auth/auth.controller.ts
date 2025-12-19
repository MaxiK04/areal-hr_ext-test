import { Controller, Post, Body, Get, UseGuards, Request, ConflictException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('register')
    async register(
        @Body() registerDto: {
            login: string;
            password: string;
            name: string;
            second_name?: string;
            role?: string
        },
        @Req() req: Request
    ) {

        const existingUser = await this.usersService.findOneByLogin(registerDto.login);
        if (existingUser) {
            throw new ConflictException('Пользователь с таким логином уже существует');
        }

        let finalRole = 'user';


        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = this.jwtService.verify(token);
                if (payload.role === 'admin' && registerDto.role === 'admin') {
                    finalRole = 'admin';
                }
            } catch (error) {

                console.log('Невалидный токен при регистрации:', error.message);
            }
        }


        const createUserDto = {
            login: registerDto.login,
            password: registerDto.password,
            name: registerDto.name,
            second_name: registerDto.second_name || '',
            last_name: '',
            role: finalRole
        };

        const user = await this.usersService.create(createUserDto);
        return user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('check')
    async check(@Request() req) {
        return { valid: true, user: req.user };
    }
}