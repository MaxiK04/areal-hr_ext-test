import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Employee } from './interfaces/employee.interface';
import { DatabaseService } from '../../database/database.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { buildUpdateQuery } from '../../common/query.helper';
import { error } from 'node:console';

@Injectable()
export class EmployeesService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findAll(): Promise<Employee[]> {
        const query = `
      SELECT * 
      FROM employees 
      WHERE deleted_at IS NULL
      ORDER BY last_name ASC, name ASC
    `;
        const result = await this.databaseService.query(query);
        return result.rows as Employee[];
    }

    async findOne(id: number): Promise<Employee> {
        const query = `
      SELECT * 
      FROM employees 
      WHERE id_employee = $1 AND deleted_at IS NULL
    `;
        const result = await this.databaseService.query(query, [id]);
        return result.rows[0] as Employee;
    }

    async create(validatedDto: CreateEmployeeDto): Promise<Employee> {
        const query = `
      INSERT INTO employees (
        second_name, 
        name, 
        last_name, 
        birth_date, 
        passport_serial, 
        passport_number, 
        passport_date, 
        passport_code, 
        passport_by, 
        registration_region,
        registration_city, 
        registration_street, 
        registration_house, 
        registration_korp, 
        registration_apart
      ) 
      VALUES ($1, $2, $3,$4,$5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

        try {
            const result = await this.databaseService.query(query, [
                validatedDto.second_name,
                validatedDto.name,
                validatedDto.last_name || null,
                validatedDto.birth_date,
                validatedDto.passport_serial,
                validatedDto.passport_number,
                validatedDto.passport_date,
                validatedDto.passport_code,
                validatedDto.passport_by,
                validatedDto.registration_region,
                validatedDto.registration_city,
                validatedDto.registration_street,
                validatedDto.registration_house,
                validatedDto.registration_korp || null,
                validatedDto.registration_apart|| null
            ]);
            console.log('Result:', result.rows[0]);
            return result.rows[0] as Employee;
        } catch (error: any) {
            throw new InternalServerErrorException('Failed to create employee');
        }
    }

    async update(id: number, validatedDto: UpdateEmployeeDto): Promise<Employee> {
        const current = await this.findOne(id);
        const changes = this.findChanges(current, validatedDto);

        if (Object.keys(changes).length === 0) {
            return current;
        }

        const { query, values } = buildUpdateQuery('employees', changes, id);

        try {
            const result = await this.databaseService.query(query, values);
            return result.rows[0] as Employee;
        } catch {
            throw new InternalServerErrorException('Failed to update employee');
        }
    }

    async remove(id: number): Promise<Employee> {
        const query = `
      UPDATE employees 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE id_employee = $1
      RETURNING *
    `;
        try {
            const result = await this.databaseService.query(query, [id]);
            return result.rows[0] as Employee;
        } catch {
            throw new InternalServerErrorException('Failed to delete employee');
        }
    }

    private findChanges(
        current: Employee,
        value: UpdateEmployeeDto,
    ): Partial<UpdateEmployeeDto> {
        const changes: Partial<UpdateEmployeeDto> = {};
        const fields: (keyof UpdateEmployeeDto)[] = [
            'second_name',
            'name',
            'last_name',
            'birth_date',
            'passport_serial',
            'passport_number',
            'passport_date',
            'passport_code',
            'passport_by',
            'registration_region',
            'registration_city',
            'registration_street',
            'registration_house',
            'registration_korp',
            'registration_apart',
        ];

        fields.forEach((field) => {
            if (value[field] !== undefined && value[field] !== current[field]) {
                changes[field] = value[field];
            }
        });

        return changes;
    }
}