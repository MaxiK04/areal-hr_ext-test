export class UpdateHrOperationDto {
    department_id?: number;
    set_salary?: number;
    type_action?:  'hire' | 'transfer' | 'salary_change' | 'dismissal';
}