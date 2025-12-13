
import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { File } from './interfaces/file.interface';
import { DatabaseService } from '../../database/database.service';
import { CreateFileDto } from './dto/create-file.dto';

@Injectable()
export class FilesService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findByEmployeeId(employeeId: number): Promise<File[]> {
        if (!employeeId || employeeId <= 0) {
            throw new BadRequestException('Invalid employee ID');
        }

        const query = `
            SELECT *
            FROM files
            WHERE employee_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;

        try {
            const result = await this.databaseService.query(query, [employeeId]);
            return result.rows as File[];
        } catch (error) {
            console.error('Find by employee error:', error);
            throw new InternalServerErrorException('Failed to fetch files');
        }
    }

    async findOne(id: number): Promise<File> {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid file ID');
        }

        const query = `
            SELECT *
            FROM files
            WHERE file_id = $1 AND deleted_at IS NULL
        `;

        try {
            const result = await this.databaseService.query(query, [id]);
            if (!result.rows[0]) {
                throw new NotFoundException(`File with id ${id} not found`);
            }
            return result.rows[0] as File;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Find one file error:', error);
            throw new InternalServerErrorException('Failed to fetch file');
        }
    }

    async create(validatedDto: CreateFileDto): Promise<File> {
        if (!validatedDto.name?.trim()) {
            throw new BadRequestException('File name is required');
        }
        if (!validatedDto.file_data) {
            throw new BadRequestException('File data is required');
        }
        if (!validatedDto.employee_id || validatedDto.employee_id <= 0) {
            throw new BadRequestException('Valid employee ID is required');
        }


        const query = `
            INSERT INTO files (name, file, employee_id)
            VALUES ($1, $2, $3)
                RETURNING *
        `;

        try {
            const result = await this.databaseService.query(query, [
                validatedDto.name.trim(),
                validatedDto.file_data,
                validatedDto.employee_id,
            ]);
            return result.rows[0] as File;
        } catch (error) {
            console.error('Create file error:', error);


            if (error.message?.includes('foreign key')) {
                throw new BadRequestException('Employee does not exist');
            }

            throw new InternalServerErrorException(
                `Failed to create file: ${error.message}`,
            );
        }
    }

    async remove(id: number): Promise<File> {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid file ID');
        }


        await this.findOne(id);

        const query = `
            UPDATE files
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE file_id = $1
                RETURNING *
        `;

        try {
            const result = await this.databaseService.query(query, [id]);
            return result.rows[0] as File;
        } catch (error) {
            console.error('Delete file error:', error);
            throw new InternalServerErrorException(
                `Failed to delete file: ${error.message}`,
            );
        }
    }

    async restore(id: number): Promise<File> {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid file ID');
        }

        const query = `
            UPDATE files 
            SET deleted_at = NULL 
            WHERE file_id = $1
            RETURNING *
        `;

        try {
            const result = await this.databaseService.query(query, [id]);
            if (!result.rows[0]) {
                throw new NotFoundException(`File with id ${id} not found`);
            }
            return result.rows[0] as File;
        } catch (error) {
            console.error('Restore file error:', error);
            throw new InternalServerErrorException('Failed to restore file');
        }
    }
}