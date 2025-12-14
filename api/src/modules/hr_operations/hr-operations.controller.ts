import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { HrOperationsService } from './hr-operations.service';
import { CreateHrOperationDto } from './dto/create-hr-operation.dto';
import { UpdateHrOperationDto } from './dto/update-hr-operation.dto';
import { CreateHrOperationSchema } from './schemas/create-hr-operation.schema';
import { UpdateHrOperationSchema } from './schemas/update-hr-operation.schema';

@Controller('hr-operations')
export class HrOperationsController {
    constructor(private readonly hrOperationsService: HrOperationsService) {}

    @Get()
    async findAll() {
        return this.hrOperationsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const hrOperation = await this.hrOperationsService.findOne(id);
        if (!hrOperation) {
            throw new NotFoundException(`HR operation with ID ${id} not found`);
        }
        return hrOperation;
    }

    @Get('employee/:employeeId')
    async findByEmployeeId(
        @Param('employeeId', ParseIntPipe) employeeId: number,
    ) {
        const operations = await this.hrOperationsService.findByEmployeeId(employeeId);
        if (!operations || operations.length === 0) {
            throw new NotFoundException(`No HR operations found for employee ${employeeId}`);
        }
        return operations;
    }

    @Post()
    async create(@Body() createHrOperationDto: CreateHrOperationDto) {
        const { error, value } =
            CreateHrOperationSchema.validate(createHrOperationDto);

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }

        return this.hrOperationsService.create(value);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateHrOperationDto: UpdateHrOperationDto,
    ) {
        const { error, value } =
            UpdateHrOperationSchema.validate(updateHrOperationDto);

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }

        const hrOperation = await this.hrOperationsService.update(id, value);
        if (!hrOperation) {
            throw new NotFoundException(`HR operation with ID ${id} not found`);
        }
        return hrOperation;
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const result = await this.hrOperationsService.remove(id);
        if (!result) {
            throw new NotFoundException(`HR operation with ID ${id} not found`);
        }
        return { message: `HR operation with ID ${id} deleted successfully` };
    }
}