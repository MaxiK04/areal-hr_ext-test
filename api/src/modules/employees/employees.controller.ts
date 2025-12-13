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
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateEmployeeSchema } from './schemas/create-employee.schema';
import { UpdateEmployeeSchema } from './schemas/update-employee.schema';

@Controller('employees')
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) {}

    @Get()
    async findAll() {
        return this.employeesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.employeesService.findOne(id);
    }

    @Post()
    async create(@Body() createEmployeeDto: CreateEmployeeDto) {
        const { error, value } = CreateEmployeeSchema.validate(createEmployeeDto);

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }

        return this.employeesService.create(value);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEmployeeDto: UpdateEmployeeDto,
    ) {
        const { error, value } = UpdateEmployeeSchema.validate(updateEmployeeDto);

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }
        return this.employeesService.update(id, value);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.employeesService.remove(id);
    }
}