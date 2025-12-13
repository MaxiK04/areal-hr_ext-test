export interface File {
    file_id: number;
    name: string;
    file_data: string;
    employee_id: number;
    created_at: Date;
    deleted_at: Date | null;
    updated_at: Date;
}