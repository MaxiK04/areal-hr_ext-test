// hr-operations.service.ts
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateHrOperationDto } from './dto/create-hr-operation.dto';

@Injectable()
export class HrOperationsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(validatedDto: CreateHrOperationDto): Promise<any> {
        console.log('Creating HR operation in table "operation":', validatedDto);

        try {

            const employeeCheck = await this.databaseService.query(
                'SELECT id_employee FROM employees WHERE id_employee = $1 AND deleted_at IS NULL',
                [validatedDto.employee_id]
            );

            if (employeeCheck.rows.length === 0) {
                throw new BadRequestException(`Employee with ID ${validatedDto.employee_id} not found`);
            }


            if (validatedDto.type_action !== 'HIRE') {
                const employeeStatus = await this.databaseService.query(
                    'SELECT hr_status FROM employees WHERE id_employee = $1',
                    [validatedDto.employee_id]
                );

            }

            const result = await this.databaseService.query(
                `INSERT INTO operation (
        employee_id, 
        department_id, 
        position_id, 
        set_salary,
        type_action
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [
                    validatedDto.employee_id,
                    validatedDto.department_id || null,
                    validatedDto.position_id || null,
                    validatedDto.set_salary || null,
                    validatedDto.type_action,
                ]
            );


            if (validatedDto.type_action === 'HIRE') {
                await this.databaseService.query(
                    `UPDATE employees 
         SET hr_status = 'active',
             current_department_id = $1,
             current_position_id = $2,
             current_salary = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id_employee = $4`,
                    [
                        validatedDto.department_id || null,
                        validatedDto.position_id || null,
                        validatedDto.set_salary || null,
                        validatedDto.employee_id
                    ]
                );
            }

            console.log('HR operation created successfully:', result.rows[0]);
            return result.rows[0];

        } catch (error) {
            console.error('Full error creating HR operation:', error);
            throw new InternalServerErrorException(`Failed to create HR operation: ${error.message}`);
        }
    }

    private async updateEmployeeAfterOperation(dto: CreateHrOperationDto, currentStatus: string): Promise<void> {
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

            setClauses.push('updated_at = CURRENT_TIMESTAMP');
            values.push(dto.employee_id);

            const updateQuery = `
        UPDATE employees 
        SET ${setClauses.join(', ')}
        WHERE id_employee = $${paramIndex}
      `;

            await this.databaseService.query(updateQuery, values);
        }
    }

    async findAll(): Promise<any[]> {
        try {
            const result = await this.databaseService.query(
                `SELECT o.*, e.second_name, e.name, e.last_name 
         FROM operation o
         LEFT JOIN employees e ON o.employee_id = e.id_employee
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
                'SELECT * FROM operation WHERE employee_id = $1 ORDER BY created_at DESC',
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
        LEFT JOIN departments d ON e.current_department_id = d.department_id
        LEFT JOIN positions p ON e.current_position_id = p.position_id
        WHERE e.id_employee = $1 AND e.deleted_at IS NULL`,
                [employeeId]
            );

            if (result.rows.length === 0) {
                throw new BadRequestException(`Employee with ID ${employeeId} not found`);
            }

            return result.rows[0];
        } catch (error) {
            console.error('Error getting employee state:', error);
            throw error;
        }
    }

    async findOne(id: number): Promise<any> {
        try {
            const result = await this.databaseService.query(
                'SELECT * FROM operation WHERE id = $1',
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