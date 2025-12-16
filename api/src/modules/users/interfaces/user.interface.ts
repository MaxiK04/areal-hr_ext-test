// src/modules/users/interfaces/user.interface.ts

export interface UserWithPassword {
    id_user: number;
    second_name: string;
    name: string;
    last_name?: string;
    login: string;
    password: string;
    role: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface UserWithoutPassword {
    id_user: number;
    second_name: string;
    name: string;
    last_name?: string;
    login: string;
    role: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export type User = UserWithoutPassword;