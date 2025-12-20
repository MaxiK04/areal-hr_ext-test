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
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreatePositionSchema } from './schemas/create-position.schema';
import { UpdatePositionSchema } from './schemas/update-position.schema';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PositionsController {
    constructor(private readonly positionsService: PositionsService) {}

    @Get()
    async findAll() {
        return this.positionsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.positionsService.findOne(id);
    }

    @Post()
    async create(@Body() createPositionDto: CreatePositionDto) {
        const { error, value } = CreatePositionSchema.validate(createPositionDto);

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }
        return this.positionsService.create(value);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePositionDto: UpdatePositionDto,
    ) {
        const { error, value } = UpdatePositionSchema.validate(updatePositionDto);

        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }
        return this.positionsService.update(id, value);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.positionsService.remove(id);
    }
}