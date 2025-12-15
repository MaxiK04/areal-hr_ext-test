import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class LogsService {
    constructor(private readonly databaseService: DatabaseService) {}


    async findAll(): Promise<any[]> {
        const result = await this.databaseService.query(
            `SELECT * FROM logs WHERE deleted_at IS NULL ORDER BY created_at DESC`
        );
        return result.rows;
    }


    async findOne(id: number): Promise<any> {
        const result = await this.databaseService.query(
            `SELECT * FROM logs WHERE id_log = $1 AND deleted_at IS NULL`,
            [id]
        );
        return result.rows[0] || null;
    }


    async findByUserId(userId: number): Promise<any[]> {
        const result = await this.databaseService.query(
            `SELECT * FROM logs WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    async log(userId: number, action: string, what: string, oldValue?: string): Promise<any> {
        const result = await this.databaseService.query(
            `INSERT INTO logs (user_id, whose_actions, object_operation, new_field, old_field)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [userId, 'user', action, what, oldValue || '']
        );
        return result.rows[0];
    }


    async update(id: number, updateData: Partial<any>): Promise<any> {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updateData.whose_actions) {
            fields.push(`whose_actions = $${paramIndex}`);
            values.push(updateData.whose_actions);
            paramIndex++;
        }

        if (updateData.object_operation) {
            fields.push(`object_operation = $${paramIndex}`);
            values.push(updateData.object_operation);
            paramIndex++;
        }

        if (updateData.new_field) {
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

        values.push(id);

        const query = `
      UPDATE logs 
      SET ${fields.join(', ')}
      WHERE id_log = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;

        const result = await this.databaseService.query(query, values);
        return result.rows[0];
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.databaseService.query(
            `UPDATE logs SET deleted_at = NOW() WHERE id_log = $1`,
            [id]
        );
        return result.rowCount > 0;
    }
    async created(userId: number, what: string): Promise<any> {
        return this.log(userId, 'created', `Создал: ${what}`);
    }

    async updated(userId: number, what: string, from: string, to: string): Promise<any> {
        return this.log(userId, 'updated', `${what}: ${to}`, `Было: ${from}`);
    }

    async deleted(userId: number, what: string): Promise<any> {
        return this.log(userId, 'deleted', `Удалил: ${what}`);
    }
}