import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    Patch,
    Delete,
    BadRequestException,
    UseGuards,
    Request
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateEmployeeSchema } from './schemas/create-employee.schema';
import { UpdateEmployeeSchema } from './schemas/update-employee.schema';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) {}

    @Get('with-details')
    @Public()
    async findAllWithDetails() {
        return this.employeesService.findAllWithDetails();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.employeesService.findOne(id);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: { hr_status: string },
        @Request() req
    ) {
        const userId = req.user?.id || 0;
        return this.employeesService.update(id, {
            hr_status: updateStatusDto.hr_status
        } as UpdateEmployeeDto, userId);
    }

    @Post()
    async create(
        @Body() createEmployeeDto: CreateEmployeeDto,
        @Request() req
    ) {
        const { error, value } = CreateEmployeeSchema.validate(createEmployeeDto);

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }
        console.log('Request user:', req.user);

        const userId = req.user?.id_user ||
            req.user?.id ||
            req.user?.sub ||
            req.user?.userId ||
            0;
        if (!userId) {
            console.warn('No userId found in request');
        }
        return this.employeesService.create(value, userId);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEmployeeDto: UpdateEmployeeDto,
        @Request() req
    ) {
        const { error, value } = UpdateEmployeeSchema.validate(updateEmployeeDto);

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }

        const userId = req.user?.id || 0;
        console.log('Update by user ID:', userId);

        return this.employeesService.update(id, value, userId);
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ) {
        const userId = req.user?.id || 0;
        console.log('Delete by user ID:', userId);
        return this.employeesService.remove(id, userId);
    }
}