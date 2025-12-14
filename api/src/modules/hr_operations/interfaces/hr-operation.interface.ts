export interface HrOperation {
    id: number;
    employee_id: number;
    department_id: number | null;
    position_id: number | null;
    set_salary: number | null;
    type_action: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}