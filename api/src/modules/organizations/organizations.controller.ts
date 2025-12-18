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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateOrganizationSchema } from './schemas/create-organization.schema';
import { UpdateOrganizationSchema } from './schemas/update-organization.schema';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) {}

    @Get()
    async findAll() {
        return this.organizationsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.organizationsService.findOne(id);
    }

    @Post()
    async create(@Body() createOrganizationDto: CreateOrganizationDto) {
        const { error, value } = CreateOrganizationSchema.validate(
            createOrganizationDto,
        );

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }

        return this.organizationsService.create(value);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateOrganizationDto: UpdateOrganizationDto,
    ) {
        const { error, value } = UpdateOrganizationSchema.validate(
            updateOrganizationDto,
        );

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }
        return this.organizationsService.update(id, value);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.organizationsService.remove(id);
    }
}