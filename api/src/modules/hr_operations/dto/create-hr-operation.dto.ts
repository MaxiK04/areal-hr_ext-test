export class CreateHrOperationDto {
    employee_id: number;
    department_id?: number;
    position_id?: number;
    set_salary?: number;
    type_action: 'hire' | 'transfer' | 'salary_change' | 'dismissal';
}