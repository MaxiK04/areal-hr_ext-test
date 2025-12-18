import { Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';

@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogsController {
    constructor(private readonly logsService: LogsService) {}

    @Get()
    async findAll() {
        return this.logsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.logsService.findOne(+id);
    }

    @Get('user/:userId')
    async findByUserId(@Param('userId') userId: string) {
        return this.logsService.findByUserId(+userId);
    }

    @Post()
    async create(@Body() body: {
        userId: number;
        action: string;
        what: string;
        oldValue?: string;
    }) {
        return this.logsService.log(
            body.userId,
            body.action,
            body.what,
            body.oldValue
        );
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateData: any
    ) {
        return this.logsService.update(+id, updateData);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        const deleted = await this.logsService.delete(+id);
        return { success: deleted };
    }
}