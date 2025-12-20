import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    Put,
    Delete,
    BadRequestException,
    UseGuards,
    Request
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
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
    async create(
        @Body() createOrganizationDto: CreateOrganizationDto,
        @Request() req
    ) {
        const userId = req.user?.id_user || req.user?.id || 0;
        return this.organizationsService.create(createOrganizationDto, userId);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateOrganizationDto: UpdateOrganizationDto,
        @Request() req
    ) {
        const userId = req.user?.id_user || req.user?.id || 0;
        return this.organizationsService.update(id, updateOrganizationDto, userId);
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ) {
        const userId = req.user?.id_user || req.user?.id || 0;
        return this.organizationsService.remove(id, userId);
    }
}