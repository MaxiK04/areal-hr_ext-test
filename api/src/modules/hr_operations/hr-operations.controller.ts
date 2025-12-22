import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request // ДОБАВЬТЕ этот импорт
} from '@nestjs/common';
import { HrOperationsService } from './hr-operations.service';
import { CreateHrOperationDto } from './dto/create-hr-operation.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('hr-operations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HrOperationsController {
    constructor(private readonly hrOperationsService: HrOperationsService) {}

    @Post()
    create(
        @Body() createHrOperationDto: CreateHrOperationDto,
        @Request() req
    ) {

        const userId = req.user?.id ||
            req.user?.id_user ||
            req.user?.sub ||
            req.user?.userId ||
            0;

        console.log('Создание HR операции, userId:', userId);
        return this.hrOperationsService.create(createHrOperationDto, userId);
    }

    @Get()
    @Public()
    async findAll() {
        return this.hrOperationsService.findAll();
    }

    @Get('employee/:employeeId')
    findByEmployeeId(@Param('employeeId') employeeId: string) {
        return this.hrOperationsService.findByEmployeeId(+employeeId);
    }

    @Get('employee/:employeeId/state')
    async getEmployeeState(@Param('employeeId') employeeId: string) {
        const state = await this.hrOperationsService.getEmployeeCurrentState(+employeeId);
        if (!state) {
            return {
                id_employee: +employeeId,
                hr_status: 'inactive',
                current_department_id: null,
                department_name: null,
                current_position_id: null,
                position_name: null,
                current_salary: null
            };
        }
        return state;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.hrOperationsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateHrOperationDto: any) {
        return this.hrOperationsService.update(+id, updateHrOperationDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.hrOperationsService.remove(+id);
    }
}