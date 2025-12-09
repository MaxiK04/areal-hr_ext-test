import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) {}

    @Post()
    create(@Body() body: any) {
        return this.organizationsService.create(body.name, body.comment);
    }

    @Get()
    findAll() {
        return this.organizationsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.organizationsService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.organizationsService.update(+id, body.name, body.comment);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.organizationsService.remove(+id);
    }
}