import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    Delete,
    BadRequestException,
    UseInterceptors,
    UploadedFile,
    Res,
    Query,
    NotFoundException,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CreateFileSchema } from './schemas/create-file.schema';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Get()
    async getAllFiles(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return {
            message: 'Files endpoint',
            endpoints: [
                'GET /files - список всех файлов',
                'GET /files/employee/:id - файлы сотрудника',
                'GET /files/:id - файл по ID',
                'GET /files/:id/download - скачать файл',
                'POST /files/upload - загрузить файл',
                'DELETE /files/:id - удалить файл'
            ],
            page: page || 1,
            limit: limit || 10
        };
    }

    @Get('employee/:employeeId')
    async getEmployeeFiles(
        @Param('employeeId', ParseIntPipe) employeeId: number,
    ) {
        if (employeeId <= 0) {
            throw new BadRequestException('Invalid employee ID');
        }
        return this.filesService.findByEmployeeId(employeeId);
    }

    @Get(':id')
    async getFile(@Param('id', ParseIntPipe) id: number) {
        return this.filesService.findOne(id);
    }

    @Get(':id/download')
    async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const file = await this.filesService.findOne(id);

        if (!file.file_data.startsWith('/uploads/')) {
            throw new NotFoundException('File path is invalid');
        }

        const filePath = join(process.cwd(), file.file_data);

        if (!existsSync(filePath)) {
            throw new NotFoundException('File not found on disk');
        }

        return res.download(filePath, file.name);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const employeeId = req.query.employee_id as string;

                if (!employeeId) {
                    return cb(new BadRequestException('Employee ID is required'), null);
                }
                const parsedEmployeeId = parseInt(employeeId);
                if (isNaN(parsedEmployeeId) || parsedEmployeeId <= 0) {
                    return cb(new BadRequestException('Invalid employee ID'), null);
                }

                const uploadsRoot = join(process.cwd(), 'uploads');
                const employeeDir = join(uploadsRoot, employeeId);
                if (!existsSync(employeeDir)) {
                    mkdirSync(employeeDir, { recursive: true });
                }

                cb(null, employeeDir);
            },
            filename: (req, file, cb) => {
                const timestamp = Date.now();
                const random = Math.random().toString(36).substring(2, 15);
                const originalName = file.originalname;
                const extension = originalName.split('.').pop() || '';
                let fileName;
                if (extension && originalName.includes('.')) {
                    fileName = `${timestamp}-${random}.${extension}`;
                } else {
                    fileName = `${timestamp}-${random}`;
                }

                cb(null, fileName);
            },
        }),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('employee_id') employeeIdParam: string,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        const parsedEmployeeId = parseInt(employeeIdParam);
        if (isNaN(parsedEmployeeId) || parsedEmployeeId <= 0) {
            if (file.path && existsSync(file.path)) {
                unlinkSync(file.path);
            }
            throw new BadRequestException('Valid employee ID is required');
        }


        const dbFilePath = `/uploads/${parsedEmployeeId}/${file.filename}`;
        const { error } = CreateFileSchema.validate({
            name: file.originalname,
            employee_id: parsedEmployeeId,
        });

        if (error) {
            if (file.path && existsSync(file.path)) {
                unlinkSync(file.path);
            }
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }

        try {
            const createdFile = await this.filesService.create({
                name: file.originalname,
                file_data: dbFilePath,
                employee_id: parsedEmployeeId,
            });

            return createdFile;
        } catch (serviceError) {
            if (file.path && existsSync(file.path)) {
                unlinkSync(file.path);
            }
            throw serviceError;
        }
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const file = await this.filesService.remove(id);


        if (file.file_data && file.file_data.startsWith('/uploads/')) {
            const filePath = join(process.cwd(), file.file_data);
            if (existsSync(filePath)) {
                try {
                    unlinkSync(filePath);
                } catch (err) {
                    console.error('Failed to delete file from disk:', err);
                }
            }
        }

        return file;
    }
}