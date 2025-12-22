export enum HrActionType {
    EMPLOYMENT = 'HIRE',
    DISMISSAL = 'DISMISSAL',
    TRANSFER = 'TRANSFER',
    SALARY_CHANGE = 'SALARY_CHANGE',
}

export class CreateHrOperationDto {
    employee_id: number;
    type_action: string;
    department_id?: number;
    position_id?: number;
    set_salary?: string;
}