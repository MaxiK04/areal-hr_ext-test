export interface Department {
    department_id: number;
    id_organization: number;
    name: string;
    comment: string;
    parent_id: number | null;
    created_at: Date;
    deleted_at: Date | null;
    updated_at: Date;
}