export interface Department {
    id_department: number;
    orgnization_od: number;
    name: string;
    comment: string;
    parent_id: number | null;
    created_at: Date;
    deleted_at: Date | null;
    updated_at: Date;
}