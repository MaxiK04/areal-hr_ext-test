import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class OrganizationsService {
    constructor(@Inject('PG_POOL') private pool: Pool) {}

    async create(name: string, comment?: string) {
        const result = await this.pool.query(
            `INSERT INTO organization (name, comment) VALUES ($1, $2) RETURNING *`,
            [name, comment || null]
        );
        return result.rows[0];
    }

    async findAll() {
        const result = await this.pool.query(
            `SELECT * FROM organization WHERE deleted_at IS NULL ORDER BY created_at DESC`
        );
        return result.rows;
    }

    async findOne(id: number) {
        const result = await this.pool.query(
            `SELECT * FROM organization WHERE id_organization = $1 AND deleted_at IS NULL`,
            [id]
        );
        return result.rows[0];
    }

    async update(id: number, name?: string, comment?: string) {
        const result = await this.pool.query(
            `UPDATE organization SET name = COALESCE($2, name), comment = COALESCE($3, comment), updated_at = NOW() 
       WHERE id_organization = $1 AND deleted_at IS NULL 
       RETURNING *`,
            [id, name || null, comment || null]
        );
        return result.rows[0];
    }

    async remove(id: number) {
        await this.pool.query(
            `UPDATE organization SET deleted_at = NOW() WHERE id_organization = $1`,
            [id]
        );
    }
}