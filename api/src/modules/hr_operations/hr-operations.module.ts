import { Module } from '@nestjs/common';
import { HrOperationsController } from './hr-operations.controller';
import { HrOperationsService } from './hr-operations.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [HrOperationsController],
    providers: [HrOperationsService],
})
export class HrOperationsModule {}