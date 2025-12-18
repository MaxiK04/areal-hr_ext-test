import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { DatabaseModule } from '../../database/database.module';
import { LogsModule } from '../logs/logs.module';

@Module({
    imports: [DatabaseModule,
        LogsModule],
    controllers: [EmployeesController],
    providers: [EmployeesService],
    exports: [EmployeesService]
})
export class EmployeesModule {}