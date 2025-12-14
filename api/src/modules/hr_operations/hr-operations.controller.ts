import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HrOperationsService } from './hr-operations.service';
import { CreateHrOperationDto } from './dto/create-hr-operation.dto';

@Controller('hr-operations')
export class HrOperationsController {
    constructor(private readonly hrOperationsService: HrOperationsService) {}

    @Post()
    create(@Body() createHrOperationDto: CreateHrOperationDto) {
        return this.hrOperationsService.create(createHrOperationDto);
    }

    @Get()
    findAll() {
        return this.hrOperationsService.findAll();
    }

    @Get('employee/:employeeId')
    findByEmployeeId(@Param('employeeId') employeeId: string) {
        return this.hrOperationsService.findByEmployeeId(+employeeId);
    }

    @Get('employee/:employeeId/state')
    getEmployeeState(@Param('employeeId') employeeId: string) {
        return this.hrOperationsService.getEmployeeCurrentState(+employeeId);
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