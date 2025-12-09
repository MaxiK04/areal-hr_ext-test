import {Global, Module } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
    providers: [
        {
            provide: 'PG_POOL',
            useFactory: () => {
                return new Pool({
                    host: 'localhost',
                    port: 5433,
                    user: 'postgres',
                    password: 'qwertyui',
                    database: 'hr-system',
                });
            },
        },
    ],
    exports: ['PG_POOL'],
})
export class DatabaseModule {}
