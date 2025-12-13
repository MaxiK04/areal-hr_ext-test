import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule, MulterModule],
    controllers: [FilesController],
    providers: [FilesService],
})
export class FilesModule {}