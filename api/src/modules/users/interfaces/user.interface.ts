export interface User {
    id_user: number;
    second_name: string;
    name: string;
    last_name: string | null;
    login: string;
    password: string;
    role: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}