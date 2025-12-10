export interface Organization {
    id_organization?: number;
    name: string;
    comment?: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
}