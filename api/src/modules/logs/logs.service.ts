import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Log } from './interfaces/log.interface';
import { DatabaseService } from '../../database/database.service';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class LogsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findAll(): Promise<Log[]> {
        const query = `
            SELECT *
            FROM logs
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
        `;
        const result = await this.databaseService.query(query);
        return result.rows as Log[];
    }

    async findOne(id: number): Promise<Log> {
        const query = `
            SELECT *
            FROM logs
            WHERE id_log = $1 AND deleted_at IS NULL
        `;
        const result = await this.databaseService.query(query, [id]);
        return result.rows[0] as Log;
    }

    async findByUserId(userId: number): Promise<Log[]> {
        const query = `
            SELECT *
            FROM logs
            WHERE user_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;
        const result = await this.databaseService.query(query, [userId]);
        return result.rows as Log[];
    }

    async create(createLogDto: CreateLogDto): Promise<Log> {
        const query = `
            INSERT INTO logs (
                user_id, 
                whose_actions, 
                object_operation, 
                new_field, 
                old_field
            ) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        try {
            const result = await this.databaseService.query(query, [
                createLogDto.user_id,
                createLogDto.whose_actions,
                createLogDto.object_operation,
                createLogDto.new_field,
                createLogDto.old_field,
            ]);
            return result.rows[0] as Log;
        } catch (error) {
            console.error('Error creating log:', error);
            throw new InternalServerErrorException('Failed to create log');
        }
    }

    async softDelete(id: number): Promise<boolean> {
        const query = `
            UPDATE logs 
            SET deleted_at = CURRENT_TIMESTAMP 
            WHERE id_log = $1 AND deleted_at IS NULL
            RETURNING id_log
        `;
        const result = await this.databaseService.query(query, [id]);
        return result.rowCount > 0;
    }

    async update(id: number, updateData: Partial<Log>): Promise<Log> {
        const fields = [];
        const values = [];
        let paramIndex = 1;


        if (updateData.whose_actions !== undefined) {
            fields.push(`whose_actions = $${paramIndex}`);
            values.push(updateData.whose_actions);
            paramIndex++;
        }
        if (updateData.object_operation !== undefined) {
            fields.push(`object_operation = $${paramIndex}`);
            values.push(updateData.object_operation);
            paramIndex++;
        }
        if (updateData.new_field !== undefined) {
            fields.push(`new_field = $${paramIndex}`);
            values.push(updateData.new_field);
            paramIndex++;
        }
        if (updateData.old_field !== undefined) {
            fields.push(`old_field = $${paramIndex}`);
            values.push(updateData.old_field);
            paramIndex++;
        }


        fields.push(`updated_at = CURRENT_TIMESTAMP`);

        if (fields.length === 1) { // Только updated_at
            throw new Error('No fields to update');
        }

        values.push(id);
        const query = `
            UPDATE logs 
            SET ${fields.join(', ')}
            WHERE id_log = $${paramIndex} AND deleted_at IS NULL
            RETURNING *
        `;

        try {
            const result = await this.databaseService.query(query, values);
            return result.rows[0] as Log;
        } catch (error) {
            console.error('Error updating log:', error);
            throw new InternalServerErrorException('Failed to update log');
        }
    }
}