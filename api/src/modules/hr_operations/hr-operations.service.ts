import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateHrOperationDto } from './dto/create-hr-operation.dto';

@Injectable()
export class HrOperationsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(createHrOperationDto: CreateHrOperationDto, userId: number): Promise<any> {
        console.log('=== Создание HR операции ===');
        console.log('Данные операции:', createHrOperationDto);
        console.log('User ID:', userId);
        const setSalary = createHrOperationDto.set_salary ?
            parseFloat(createHrOperationDto.set_salary) :
            null;

        const operationQuery = `
        INSERT INTO operation (
            employee_id,
            department_id,
            position_id,
            set_salary,
            type_action,
            created_at,
            created_by
        )
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
        RETURNING *
    `;

        try {
            const operationResult = await this.databaseService.query(operationQuery, [
                createHrOperationDto.employee_id,
                createHrOperationDto.department_id || null,
                createHrOperationDto.position_id || null,
                setSalary,
                createHrOperationDto.type_action,
                userId
            ]);

            console.log('Операция создана:', operationResult.rows[0]);
            const updateEmployeeQuery = `
                UPDATE employees
                SET
                    current_department_id = COALESCE($1, current_department_id),
                    current_position_id = COALESCE($2, current_position_id),
                    current_salary = COALESCE($3::DECIMAL(10,2), current_salary),
                    hr_status = CASE
                                    WHEN $4 = 'HIRE' THEN 'active'
                                    WHEN $4 = 'DISMISSAL' THEN 'dismiss'
                                    ELSE hr_status
                        END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id_employee = $5 AND deleted_at IS NULL
                    RETURNING *
            `;

            const updateResult = await this.databaseService.query(updateEmployeeQuery, [
                createHrOperationDto.department_id || null,
                createHrOperationDto.position_id || null,
                setSalary,
                createHrOperationDto.type_action,
                createHrOperationDto.employee_id
            ]);

            console.log('Сотрудник обновлен:', updateResult.rows[0]);
            console.log('=== Конец создания операции ===');

            return operationResult.rows[0];
        } catch (error: any) {
            console.error('Ошибка создания HR операции:', error.message);
            console.error('Стек:', error.stack);
            throw new InternalServerErrorException(`Failed to create HR operation: ${error.message}`);
        }
    }
    async updateEmployeeAfterOperation(dto: CreateHrOperationDto, currentStatus: string): Promise<void> {
        console.log('Updating employee after operation:', dto.type_action);

        const updateFields: any = {};

        switch (dto.type_action) {
            case 'HIRE':
                updateFields.hr_status = 'active';
                updateFields.current_department_id = dto.department_id;
                updateFields.current_position_id = dto.position_id;
                updateFields.current_salary = dto.set_salary;
                break;

            case 'DISMISSAL':
                updateFields.hr_status = 'dismiss';
                updateFields.current_department_id = null;
                updateFields.current_position_id = null;
                updateFields.current_salary = null;
                break;

            case 'TRANSFER':
                if (dto.department_id) updateFields.current_department_id = dto.department_id;
                if (dto.position_id) updateFields.current_position_id = dto.position_id;
                if (dto.set_salary) updateFields.current_salary = dto.set_salary;
                break;

            case 'SALARY_CHANGE':
                if (dto.set_salary) updateFields.current_salary = dto.set_salary;
                break;
        }
        updateFields.updated_at = new Date();

        if (Object.keys(updateFields).length > 0) {
            const setClauses = [];
            const values = [];
            let paramIndex = 1;

            Object.keys(updateFields).forEach(key => {
                if (updateFields[key] !== undefined) {
                    setClauses.push(`${key} = $${paramIndex}`);
                    values.push(updateFields[key]);
                    paramIndex++;
                }
            });

            values.push(dto.employee_id);

            const updateQuery = `
                UPDATE employees 
                SET ${setClauses.join(', ')}
                WHERE id_employee = $${paramIndex}
            `;

            console.log('Update query:', updateQuery, values);
            await this.databaseService.query(updateQuery, values);
        }
    }

    async findAll(): Promise<any[]> {
        try {
            const result = await this.databaseService.query(
                `SELECT
                     o.*,
                     e.second_name,
                     e.name,
                     e.last_name,
                     e.hr_status as employee_status,
                     d.name as department_name,
                     p.name as position_name
                 FROM operation o
                          LEFT JOIN employees e ON o.employee_id = e.id_employee
                          LEFT JOIN department d ON o.department_id = d.id_department
                          LEFT JOIN position p ON o.position_id = p.position_id
                 ORDER BY o.created_at DESC`
            );
            return result.rows;
        } catch (error) {
            console.error('Error finding HR operations:', error);
            return [];
        }
    }

    async findByEmployeeId(employeeId: number): Promise<any[]> {
        try {
            const result = await this.databaseService.query(
                `SELECT o.*, 
                    d.name as department_name,
                    p.name as position_name
                FROM operation o
                LEFT JOIN department d ON o.department_id = d.id_department
                LEFT JOIN position p ON o.position_id = p.position_id
                WHERE o.employee_id = $1 
                ORDER BY o.created_at DESC`,
                [employeeId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error finding HR operations by employee:', error);
            return [];
        }
    }
    async getEmployeeCurrentState(employeeId: number): Promise<any> {
        try {
            const result = await this.databaseService.query(
                `SELECT
                     e.id_employee,
                     e.second_name,
                     e.name,
                     e.last_name,
                     e.hr_status,
                     e.current_department_id,
                     d.name as department_name,
                     e.current_position_id,
                     p.name as position_name,
                     e.current_salary               
                 FROM employees e
                          LEFT JOIN department d ON e.current_department_id = d.id_department
                          LEFT JOIN position p ON e.current_position_id = p.position_id
                 WHERE e.id_employee = $1 AND e.deleted_at IS NULL`,
                [employeeId]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            console.error('Error getting employee state:', error);
            return null;
        }
    }

    async findOne(id: number): Promise<any> {
        try {
            const result = await this.databaseService.query(
                `SELECT o.*, 
                    e.second_name, 
                    e.name, 
                    e.last_name,
                    e.hr_status as employee_status
                FROM operation o
                LEFT JOIN employees e ON o.employee_id = e.id_employee
                WHERE o.id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                throw new BadRequestException(`HR operation with ID ${id} not found`);
            }

            return result.rows[0];
        } catch (error) {
            console.error('Error finding HR operation:', error);
            throw error;
        }
    }

    async update(id: number, updateHrOperationDto: any): Promise<any> {
        throw new BadRequestException('Update not implemented for HR operations');
    }

    async remove(id: number): Promise<void> {
        try {
            await this.databaseService.query(
                'DELETE FROM operation WHERE id = $1',
                [id]
            );
        } catch (error) {
            console.error('Error removing HR operation:', error);
            throw error;
        }
    }
}