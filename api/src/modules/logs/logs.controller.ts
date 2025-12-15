import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { Log } from './interfaces/log.interface';

@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) {}

    @Get()
    async findAll(): Promise<Log[]> {
        return this.logsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Log> {
        return this.logsService.findOne(+id);
    }

    @Get('user/:userId')
    async findByUserId(@Param('userId') userId: string): Promise<Log[]> {
        return this.logsService.findByUserId(+userId);
    }

    @Post()
    async create(@Body() createLogDto: CreateLogDto): Promise<Log> {
        return this.logsService.create(createLogDto);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<Log>
    ): Promise<Log> {
        return this.logsService.update(+id, updateData);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<{ success: boolean }> {
        const deleted = await this.logsService.softDelete(+id);
        return { success: deleted };
    }
}