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
    UseGuards
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateDepartmentSchema } from './schemas/create-department.schema';
import { UpdateDepartmentSchema } from './schemas/update-department.schema';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
    constructor(private readonly departmentsService: DepartmentsService) {}
    @Public()
    @Get()
    async findAll() {
        return this.departmentsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.departmentsService.findOne(id);
    }

    @Post()
    async create(@Body() createDepartmentDto: CreateDepartmentDto) {
        const { error, value } =
            CreateDepartmentSchema.validate(createDepartmentDto);

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }

        return this.departmentsService.create(value);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDepartmentDto: UpdateDepartmentDto,
    ) {
        const { error, value } =
            UpdateDepartmentSchema.validate(updateDepartmentDto);

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }
        return this.departmentsService.update(id, value);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.departmentsService.remove(id);
    }
}