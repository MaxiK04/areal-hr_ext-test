import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: 'localhost',
            port: 5433,
            user: 'postgres',
            password: 'qwertyui',
            database: 'hr-system',
        });
    }

    async query(text: string, params?: any[]) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } finally {
            client.release();
        }
    }
}