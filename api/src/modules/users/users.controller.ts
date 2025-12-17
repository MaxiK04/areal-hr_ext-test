
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    Query,
    UsePipes,
    ValidationPipe,
    HttpCode,
    HttpStatus,
    UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './interfaces/user.interface';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Public()
    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get('deleted')
    async findDeleted(): Promise<User[]> {
        return this.usersService.findDeleted();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<User> {
        return this.usersService.findOne(+id);
    }
    @Public()
    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @Put(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        await this.usersService.remove(+id);
    }

    @Post(':id/restore')
    async restore(@Param('id') id: string): Promise<{ success: boolean }> {
        const restored = await this.usersService.restore(+id);
        return { success: restored };
    }

    @Public()
    @Post('login')
    async login(@Body() body: { login: string; password: string }): Promise<any> {
        const user = await this.usersService.validateUser(body.login, body.password);

        if (!user) {
            return {
                success: false,
                message: 'Неверный логин или пароль'
            };
        }
        return {
            success: true,
            user: {
                id_user: user.id_user,
                name: user.name,
                second_name: user.second_name,
                login: user.login,
                role: user.role
            }
        };
    }
}