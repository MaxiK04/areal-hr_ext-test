import { EmployeeStatus } from '../../hr_operations/enums/employee-status.enum';

export interface Employee {
    id_employee: number;
    second_name: string;
    name: string;
    last_name: string;
    birth_date: string;
    passport_serial: string;
    passport_number: string;
    passport_date: string;
    passport_code: string;
    passport_by: string;
    registration_region: string;
    registration_city: string;
    registration_street: string;
    registration_house: string;
    registration_korp: string;
    registration_apart: string;
    hr_status: EmployeeStatus;
    current_department_id: number | null;
    current_position_id: number | null;
    current_salary: number | null;
    created_at: Date;
    deleted_at: Date | null;
    updated_at: Date;
}