export interface Log {
    id_log: number;
    user_id: number;
    whose_actions: string;
    object_operation: string;
    new_field: string;
    old_field: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}