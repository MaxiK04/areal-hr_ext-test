import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';

import { HrOperation } from './interfaces/hr-operation.interface';
import { DatabaseService } from '../../database/database.service';
import { CreateHrOperationDto } from './dto/create-hr-operation.dto';
import { EmployeeStatus } from './enums/employee-status.enum';
import { UpdateHrOperationDto } from './dto/update-hr-operation.dto';

@Injectable()
export class HrOperationsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findAll(): Promise<HrOperation[]> {
        const query = `
            SELECT * 
            FROM operation
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
        `;
        const result = await this.databaseService.query(query);
        return result.rows as HrOperation[];
    }

    async findOne(id: number): Promise<HrOperation | null> {
        const query = `
            SELECT * 
            FROM operation
            WHERE id = $1 AND deleted_at IS NULL
        `;
        const result = await this.databaseService.query(query, [id]);
        return result.rows[0] as HrOperation || null;
    }

    async findByEmployeeId(employeeId: number): Promise<HrOperation[]> {
        const query = `
            SELECT *
            FROM operation
            WHERE employee_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;
        const result = await this.databaseService.query(query, [employeeId]);
        return result.rows as HrOperation[];
    }

    async update(id: number, updateHrOperationDto: UpdateHrOperationDto): Promise<HrOperation | null> {

        const existing = await this.findOne(id);
        if (!existing) {
            throw new NotFoundException(`HR operation with ID ${id} not found`);
        }

        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(updateHrOperationDto).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            throw new BadRequestException('No fields to update');
        }

        values.push(id);
        const query = `
            UPDATE operation
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await this.databaseService.query(query, values);
        return result.rows[0] as HrOperation;
    }

    async remove(id: number): Promise<boolean> {
        const query = `
            UPDATE operation
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING id
        `;
        const result = await this.databaseService.query(query, [id]);

        if (result.rows.length === 0) {
            throw new NotFoundException(`HR operation with ID ${id} not found`);
        }

        return true;
    }

    async create(validatedDto: CreateHrOperationDto): Promise<HrOperation> {

        const employeeQuery = `
            SELECT id_employee, hr_status, current_department_id, current_position_id, current_salary
            FROM employees
            WHERE employee_id = $1 AND deleted_at IS NULL
        `;

        const employeeResult = await this.databaseService.query(employeeQuery, [
            validatedDto.employee_id,
        ]);

        if (employeeResult.rows.length === 0) {
            throw new BadRequestException(`Employee with ID ${validatedDto.employee_id} not found`);
        }

        const employee = employeeResult.rows[0];

        this.validateTransition(employee.hr_status, validatedDto.type_action);


        const changes = this.findHrChanges(employee, validatedDto);

        if (validatedDto.type_action !== 'dismissal' && Object.keys(changes).length <= 1) {
            throw new BadRequestException('No changes detected for operation');
        }

        const operationQuery = `
            INSERT INTO operation (
                employee_id,
                department_id,
                position_id,
                set_salary,
                type_action,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                RETURNING *
        `;

        try {
            const operationResult = await this.databaseService.query(operationQuery, [
                validatedDto.employee_id,
                validatedDto.department_id,
                changes.position_id || null,
                changes.type_action || null,
                changes.set_salary || null,
            ]);

            const operation = operationResult.rows[0] as HrOperation;

            await this.updateEmployeeState(validatedDto.employee_id, validatedDto, employee.hr_status);

            return operation;
        } catch (error) {
            console.error('Error creating HR operation:', error);
            throw new InternalServerErrorException('Failed to create HR operation');
        }
    }

    private validateTransition(
        currentStatus: EmployeeStatus,
        operationType: string,
    ): void {
        const allowed: Record<string, string[]> = {
            [EmployeeStatus.INACTIVE]: ['hire'], // Неактивного можно нанять
            [EmployeeStatus.ACTIVE]: ['transfer', 'salary_change', 'dismissal'], // Активного можно перевести, изменить зп или уволить
            [EmployeeStatus.ON_VACATION]: ['transfer', 'salary_change', 'dismissal'], // В отпуске можно те же операции
            [EmployeeStatus.DISMISSED]: ['hire'], // Уволенного можно нанять снова
        };

        if (!allowed[currentStatus]) {
            throw new BadRequestException(
                `Status "${currentStatus}" is not supported`
            );
        }


        if (!allowed[currentStatus].includes(operationType)) {
            throw new BadRequestException(
                `Operation "${operationType}" is not allowed for employee with status "${currentStatus}"`
            );
        }
    }

    private async updateEmployeeState(
        employeeId: number,
        dto: CreateHrOperationDto,
        currentStatus: EmployeeStatus
    ): Promise<void> {
        let updateFields: Record<string, any> = {};
        let newStatus = currentStatus;

        switch (dto.type_action) {
            case 'hire':
                updateFields = {
                    hr_status: 'ACTIVE',
                    current_department_id: dto.department_id,
                    current_position_id: dto.position_id,
                    current_salary: dto.set_salary,
                };
                newStatus = EmployeeStatus.ACTIVE;
                break;

            case 'transfer':
                updateFields = {
                    current_department_id: dto.department_id,
                    current_position_id: dto.position_id || null,
                };
                break;

            case 'salary_change':
                updateFields = {
                    current_salary: dto.set_salary,
                };
                break;

            case 'dismissal':
                updateFields = {
                    hr_status: 'DISMISSED',
                    current_department_id: null,
                    current_position_id: null,
                    current_salary: null,
                };
                newStatus = EmployeeStatus.DISMISSED;
                break;
        }

        if (Object.keys(updateFields).length > 0) {
            const setClauses = Object.keys(updateFields)
                .map((key, index) => `${key} = $${index + 2}`)
                .join(', ');

            const updateQuery = `
                UPDATE employees 
                SET ${setClauses}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `;

            await this.databaseService.query(updateQuery, [
                employeeId,
                ...Object.values(updateFields),
            ]);
        }
    }

    private findHrChanges(
        employee: any,
        dto: CreateHrOperationDto,
    ): Partial<CreateHrOperationDto> {
        const changes: Partial<CreateHrOperationDto> = {
            type_action: dto.type_action
        };

        switch (dto.type_action) {
            case 'hire':
                // Для найма всегда устанавливаем все поля
                changes.department_id = dto.department_id;
                changes.position_id = dto.position_id;
                changes.set_salary = dto.set_salary;
                break;

            case 'transfer':
                // Для перевода проверяем, есть ли изменения
                if (dto.department_id !== undefined &&
                    dto.department_id !== employee.current_department_id) {
                    changes.department_id = dto.department_id;
                }
                if (dto.position_id !== undefined &&
                    dto.position_id !== employee.current_position_id) {
                    changes.position_id = dto.position_id;
                }
                break;

            case 'salary_change':
                // Для изменения зарплаты
                if (dto.set_salary !== undefined &&
                    dto.set_salary !== employee.current_salary) {
                    changes.set_salary = dto.set_salary;
                }
                break;

            case 'dismissal':
                // Для увольнения не нужно передавать изменения в полях
                break;
        }

        return changes;
    }

    // Дополнительный метод для проверки валидации
    async validateCreateDto(dto: CreateHrOperationDto): Promise<void> {
        // Проверка обязательных полей для разных типов операций
        switch (dto.type_action) {
            case 'hire':
                if (!dto.department_id || !dto.position_id || !dto.set_salary) {
                    throw new BadRequestException(
                        'For "hire" operation: department_id, position_id, and set_salary are required'
                    );
                }
                break;

            case 'transfer':
                if (!dto.department_id && !dto.position_id) {
                    throw new BadRequestException(
                        'For "transfer" operation: at least department_id or position_id must be provided'
                    );
                }
                break;

            case 'salary_change':
                if (!dto.set_salary) {
                    throw new BadRequestException(
                        'For "salary_change" operation: set_salary is required'
                    );
                }
                break;

            case 'dismissal':
                // Для увольнения не нужны дополнительные поля
                break;

            default:
                throw new BadRequestException(
                    `Unknown operation type: ${dto.type_action}. Allowed: hire, transfer, salary_change, dismissal`
                );
        }
    }
}