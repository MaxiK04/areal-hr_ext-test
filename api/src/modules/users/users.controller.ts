import { Controller, Get, Post, Body, Param, Delete, Put, UsePipes, ValidationPipe, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get('deleted')
    @Roles('admin')
    async findDeleted() {
        return this.usersService.findDeleted();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Post()
    @Roles('admin')
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Put(':id')
    @Roles('admin')
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto
    ) {
        return this.usersService.update(id, updateUserDto);
    }

    @Put(':id/role')
    @Roles('admin')
    async updateRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { role: string }
    ) {
        return this.usersService.update(id, { role: body.role });
    }

    @Delete(':id')
    @Roles('admin')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const result = await this.usersService.remove(id);
        return { success: result };
    }

    @Post(':id/restore')
    @Roles('admin')
    async restore(@Param('id', ParseIntPipe) id: number) {
        const restored = await this.usersService.restore(id);
        return { success: restored };
    }
}