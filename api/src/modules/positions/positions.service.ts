import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Position } from './interfaces/position.interface';
import { DatabaseService } from '../../database/database.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { buildUpdateQuery } from '../../common/query.helper';

@Injectable()
export class PositionsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findAll(): Promise<Position[]> {
        const query = `
      SELECT *
      FROM position 
      WHERE deleted_at IS NULL
      ORDER BY name ASC
    `;
        const result = await this.databaseService.query(query);
        return result.rows as Position[];
    }

    async findOne(id: number): Promise<Position> {
        const query = `
      SELECT *
      FROM position 
      WHERE position_id = $1 AND deleted_at IS NULL
    `;
        const result = await this.databaseService.query(query, [id]);
        return result.rows[0] as Position;
    }

    async create(validateDto: CreatePositionDto): Promise<Position> {
        const query = `
      INSERT INTO position (name) 
      VALUES ($1) 
      RETURNING *
    `;

        try {
            const result = await this.databaseService.query(query, [
                validateDto.name,
            ]);
            return result.rows[0] as Position;
        } catch {
            throw new InternalServerErrorException('Failed to create position');
        }
    }

    async update(id: number, validateDto: UpdatePositionDto): Promise<Position> {
        const current = await this.findOne(id);

        const changes = this.findChanges(current, validateDto);

        if (Object.keys(changes).length === 0) {
            return current;
        }

        const { query, values } = buildUpdateQuery('positions', changes, id);

        try {
            const result = await this.databaseService.query(query, values);
            return result.rows[0] as Position;
        } catch {
            throw new InternalServerErrorException('Failed to update position');
        }
    }

    async remove(id: number): Promise<Position> {
        const query = `
      UPDATE position 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE position_id = $1
      RETURNING *
    `;

        try {
            const result = await this.databaseService.query(query, [id]);
            return result.rows[0] as Position;
        } catch {
            throw new InternalServerErrorException('Failed to delete position');
        }
    }

    private findChanges(
        current: Position,
        value: UpdatePositionDto,
    ): Partial<UpdatePositionDto> {
        const changes: Partial<UpdatePositionDto> = {};

        if (value.name !== undefined && value.name !== current.name) {
            changes.name = value.name;
        }

        return changes;
    }
}