import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
    constructor(
        private readonly databaseService: DatabaseService

    ) {}

    async findAll(): Promise<any[]> {
        const query = `
            SELECT * FROM organization
            WHERE deleted_at IS NULL
            ORDER BY name ASC
        `;
        const result = await this.databaseService.query(query);
        return result.rows;
    }

    async findOne(id: number): Promise<any> {
        const query = `
            SELECT * FROM organization
            WHERE id_organization = $1 AND deleted_at IS NULL
        `;
        const result = await this.databaseService.query(query, [id]);

        if (result.rows.length === 0) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }

        return result.rows[0];
    }

    async create(createOrganizationDto: CreateOrganizationDto, userId?: number): Promise<any> {
        const query = `
            INSERT INTO organization (name, comment)
            VALUES ($1, $2)
                RETURNING *
        `;

        try {
            const result = await this.databaseService.query(query, [
                createOrganizationDto.name,
                createOrganizationDto.comment || null
            ]);

            const organization = result.rows[0];

            console.log(`Создана организация: ${organization.name} (ID: ${organization.id_organization}) пользователем ID: ${userId}`);

            return organization;
        } catch (error) {
            console.error('Error creating organization:', error);
            throw new InternalServerErrorException('Failed to create organization');
        }
    }

    async update(id: number, updateOrganizationDto: UpdateOrganizationDto, userId?: number): Promise<any> {
        const query = `
            UPDATE organization
            SET
                name = COALESCE($1, name),
                comment = COALESCE($2, comment),
                updated_at = CURRENT_TIMESTAMP
            WHERE id_organization = $3 AND deleted_at IS NULL
                RETURNING *
        `;

        try {
            const result = await this.databaseService.query(query, [
                updateOrganizationDto.name || null,
                updateOrganizationDto.comment || null,
                id
            ]);

            if (result.rows.length === 0) {
                throw new NotFoundException(`Organization with ID ${id} not found`);
            }

            const organization = result.rows[0];


            console.log(`Обновлена организация: ${organization.name} (ID: ${id}) пользователем ID: ${userId}`);

            return organization;
        } catch (error) {
            console.error('Error updating organization:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update organization');
        }
    }

    async remove(id: number, userId?: number): Promise<any> {

        try {
            const checkDepartments = await this.databaseService.query(
                'SELECT COUNT(*) as count FROM department WHERE organization_id = $1 AND deleted_at IS NULL',
                [id]
            );

            const departmentCount = parseInt(checkDepartments.rows[0].count);
            if (departmentCount > 0) {
                throw new BadRequestException(
                    `Невозможно удалить организацию: существует ${departmentCount} связанных отделов. ` +
                    `Сначала удалите или переместите отделы.`
                );
            }

            const query = `
        UPDATE organization
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id_organization = $1
        RETURNING *
      `;

            const result = await this.databaseService.query(query, [id]);

            if (result.rows.length === 0) {
                throw new NotFoundException(`Organization with ID ${id} not found`);
            }

            const organization = result.rows[0];

            console.log(`Удалена организация: ${organization.name} (ID: ${id}) пользователем ID: ${userId}`);

            return organization;
        } catch (error) {
            console.error('Error removing organization:', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete organization');
        }
    }
}