import { Injectable, InternalServerErrorException,NotFoundException} from '@nestjs/common';
import { Employee } from './interfaces/employee.interface';
import { DatabaseService } from '../../database/database.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { buildUpdateQuery } from '../../common/query.helper';
import { error } from 'node:console';
import { LogsService } from '../logs/logs.service';


@Injectable()
export class EmployeesService {
    constructor(private readonly databaseService: DatabaseService,
    private readonly logsService: LogsService
    ) {}
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
    async create(validatedDto: CreateEmployeeDto, userId?: number): Promise<Employee> {
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
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
                validatedDto.registration_apart || null
            ]);

            const employee = result.rows[0] as Employee;
            console.log('Created employee:', employee);

            if (userId !== undefined && this.logsService) {
                try {
                    await this.logsService.log(
                        userId,
                        'create',
                        `Создан сотрудник: ${employee.second_name} ${employee.name} ${employee.last_name || ''} (ID: ${employee.id_employee})`
                    );
                } catch (logError) {
                    console.error('Failed to log employee creation:', logError);
                    console.error('=== LOGGING ERROR DETAILS ===');
                    console.error('Error:', logError);
                    console.error('Message:', logError.message);
                    console.error('Stack:', logError.stack);
                    console.error('============================');
                }
            }

            return employee;
        } catch (error: any) {
            console.error('Error creating employee:', error.message);
            console.error('=== EMPLOYEE CREATION ERROR ===');
            console.error('Full error:', error);
            throw new InternalServerErrorException('Failed to create employee');
        }
    }
    async updateAfterHrOperation(
        employeeId: number,
        operationData: {
            type_action: string;
            department_id?: number;
            position_id?: number;
            set_salary?: number;
        }
    ): Promise<Employee> {
        const query = `
        UPDATE employees 
        SET 
            current_department_id = COALESCE($1, current_department_id),
            current_position_id = COALESCE($2, current_position_id),
            current_salary = COALESCE($3, current_salary),
            hr_status = CASE 
                WHEN $4 = 'HIRE' THEN 'active'
                WHEN $4 = 'DISMISSAL' THEN 'dismiss'
                ELSE hr_status
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id_employee = $5 AND deleted_at IS NULL
        RETURNING *
    `;

        try {
            const result = await this.databaseService.query(query, [
                operationData.department_id || null,
                operationData.position_id || null,
                operationData.set_salary || null,
                operationData.type_action,
                employeeId
            ]);

            if (!result.rows[0]) {
                throw new NotFoundException(`Employee with ID ${employeeId} not found`);
            }

            return result.rows[0] as Employee;
        } catch (error: any) {
            console.error('Error updating employee after HR operation:', error.message);
            throw new InternalServerErrorException('Failed to update employee after HR operation');
        }
    }
    async findAllWithDetails(): Promise<any[]> {
        try {
            const result = await this.databaseService.query(
                `SELECT
                     e.*,
                     d.name as department_name,
                     p.name as position_name
                 FROM employees e
                          LEFT JOIN department d ON e.current_department_id = d.id_department  
                          LEFT JOIN position p ON e.current_position_id = p.position_id        
                 WHERE e.deleted_at IS NULL
                 ORDER BY e.id_employee DESC`
            );
            return result.rows;
        } catch (error) {
            console.error('Error finding employees with details:', error);
            return [];
        }
    }
    async update(id: number, validatedDto: UpdateEmployeeDto, userId?: number): Promise<Employee> {
        const query = `
            UPDATE employees
            SET
                second_name = COALESCE($1, second_name),
                name = COALESCE($2, name),
                last_name = COALESCE($3, last_name),
                birth_date = COALESCE($4, birth_date),
                passport_serial = COALESCE($5, passport_serial),
                passport_number = COALESCE($6, passport_number),
                passport_date = COALESCE($7, passport_date),
                passport_code = COALESCE($8, passport_code),
                passport_by = COALESCE($9, passport_by),
                registration_region = COALESCE($10, registration_region),
                registration_city = COALESCE($11, registration_city),
                registration_street = COALESCE($12, registration_street),
                registration_house = COALESCE($13, registration_house),
                registration_korp = COALESCE($14, registration_korp),
                registration_apart = COALESCE($15, registration_apart),
                hr_status = COALESCE($16, hr_status), 
                updated_at = CURRENT_TIMESTAMP
            WHERE id_employee = $17 AND deleted_at IS NULL
                RETURNING *
        `;

        try {
            const result = await this.databaseService.query(query, [
                validatedDto.second_name || null,
                validatedDto.name || null,
                validatedDto.last_name || null,
                validatedDto.birth_date || null,
                validatedDto.passport_serial || null,
                validatedDto.passport_number || null,
                validatedDto.passport_date || null,
                validatedDto.passport_code || null,
                validatedDto.passport_by || null,
                validatedDto.registration_region || null,
                validatedDto.registration_city || null,
                validatedDto.registration_street || null,
                validatedDto.registration_house || null,
                validatedDto.registration_korp || null,
                validatedDto.registration_apart || null,
                validatedDto.hr_status || null,
                id
            ]);

            if (!result.rows[0]) {
                throw new NotFoundException(`Employee with ID ${id} not found`);
            }

            const employee = result.rows[0];
            console.log('Updated employee:', employee);

            if (userId && userId > 0 && this.logsService) {
                await this.logsService.log(
                    userId,
                    'update',
                    `Обновлен сотрудник: ${employee.second_name} ${employee.name} (ID: ${id})`
                );
            }

            return employee;
        } catch (error: any) {
            console.error('Update error:', error.message);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update employee');
        }
    }
    async remove(id: number, userId?: number): Promise<Employee> {
        const query = `
            UPDATE employees
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id_employee = $1
                RETURNING *
        `;

        try {
            const result = await this.databaseService.query(query, [id]);

            if (!result.rows[0]) {
                throw new NotFoundException(`Employee with ID ${id} not found`);
            }

            const employee = result.rows[0];
            if (userId && userId > 0 && this.logsService) {
                await this.logsService.log(
                    userId,
                    'delete',
                    `Удален сотрудник: ${employee.second_name} ${employee.name} (ID: ${id})`
                );
            }

            return employee;
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }
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
            'hr_status' as keyof UpdateEmployeeDto,
        ];

        fields.forEach((field) => {
            if (value[field] !== undefined && value[field] !== current[field]) {
                changes[field] = value[field] as any;
            }
        });

        return changes;
    }
}