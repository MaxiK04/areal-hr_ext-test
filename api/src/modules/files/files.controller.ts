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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CreateFileSchema } from './schemas/create-file.schema';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { Response } from 'express';
import { diskStorage } from 'multer';


@Controller('files')
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
                const uploadsRoot = join(process.cwd(), 'uploads');
                const employeeId = req.body.employee_id;

                if (!employeeId) {
                    return cb(new BadRequestException('Employee ID is required'), null);
                }

                const employeeDir = join(uploadsRoot, employeeId.toString());

                if (!existsSync(employeeDir)) {
                    mkdirSync(employeeDir, { recursive: true });
                }

                cb(null, employeeDir);
            },
            filename: (req, file, cb) => {
                const timestamp = Date.now();
                const random = Math.random().toString(36).substring(2, 15);
                const extension = file.originalname.split('.').pop() || '';
                const fileName = extension
                    ? `${timestamp}-${random}.${extension}`
                    : `${timestamp}-${random}`;
                cb(null, fileName);
            },
        }),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() createFileDto: CreateFileDto,
    ) {

        const { error, value } = CreateFileSchema.validate(createFileDto);
        if (error) {

            if (file?.path && existsSync(file.path)) {
                unlinkSync(file.path);
            }
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }


        if (!file) {
            throw new BadRequestException('No file uploaded');
        }


        const dbFilePath = `/uploads/${value.employee_id}/${file.filename}`;


        return await this.filesService.create({
            name: file.originalname,
            file_data: dbFilePath,
            employee_id: value.employee_id,
        });
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