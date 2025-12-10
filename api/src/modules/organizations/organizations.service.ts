import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Organization } from './interfaces/organization.interface';
import { DatabaseService } from '../../database/database.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { buildUpdateQuery } from '../../common/query.helper';

@Injectable()
export class OrganizationsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findAll(): Promise<Organization[]> {
        const query = `
            SELECT *
            FROM organization
            WHERE deleted_at IS NULL
            ORDER BY name ASC
        `;
        const result = await this.databaseService.query(query);
        return result.rows as Organization[];
    }

    async findOne(id: number): Promise<Organization> {
        const query = `
            SELECT *
            FROM organization
            WHERE id_organization = $1 AND deleted_at IS NULL
        `;
        const result = await this.databaseService.query(query, [id]);
        return result.rows[0] as Organization;
    }

    async create(validatedDto: CreateOrganizationDto): Promise<Organization> {
        const query = `
            INSERT INTO organization (name, comment)
            VALUES ($1, $2)
                RETURNING *
        `;

        try {
            const result = await this.databaseService.query(query, [
                validatedDto.name,
                validatedDto.comment,
            ]);
            return result.rows[0] as Organization;
        } catch {
            throw new InternalServerErrorException('Failed to create organization');
        }
    }

    async update(
        id: number,
        validateDto: UpdateOrganizationDto,
    ): Promise<Organization> {
        const current = await this.findOne(id);

        const changes = this.findChanges(current, validateDto);

        if (Object.keys(changes).length === 0) {
            return current;
        }

        const { query, values } = buildUpdateQuery('organizations', changes, id);

        try {
            const result = await this.databaseService.query(query, values);
            return result.rows[0] as Organization;
        } catch {
            throw new InternalServerErrorException('Failed to update organization');
        }
    }

    async remove(id: number): Promise<Organization> {
        const query = `
            UPDATE organizations
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = $1
                RETURNING *
        `;
        try {
            const result = await this.databaseService.query(query, [id]);
            return result.rows[0] as Organization;
        } catch {
            throw new InternalServerErrorException('Failed to delete organization');
        }
    }

    private findChanges(
        current: Organization,
        value: UpdateOrganizationDto,
    ): Partial<UpdateOrganizationDto> {
        const changes: Partial<UpdateOrganizationDto> = {};

        if (value.name !== undefined && value.name !== current.name) {
            changes.name = value.name;
        }

        if (value.comment !== undefined && value.comment !== current.comment) {
            changes.comment = value.comment;
        }
        return changes;
    }
}