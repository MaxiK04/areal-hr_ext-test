

export const ObjectOperation = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    RESTORE: 'restore',
    LOGIN: 'login',
    LOGOUT: 'logout',
    PASSWORD_CHANGE: 'password_change',
    STATUS_CHANGE: 'status_change',
    ROLE_CHANGE: 'role_change',
    IMPORT: 'import',
    EXPORT: 'export',
    APPROVE: 'approve',
    REJECT: 'reject',          
} as const;

export const WhoseActions = {
    SYSTEM: 'system',
    ADMIN: 'admin',
    HR_MANAGER: 'hr_manager',
    EMPLOYEE: 'employee',
    USER: 'user',
    AUTO: 'auto',
    API: 'api',
}  as const;

export const EntityType = {
    USER: 'user',
    EMPLOYEE: 'employee',
    DEPARTMENT: 'department',
    POSITION: 'position',
    DOCUMENT: 'document',
    PASSPORT: 'passport',
    LOG: 'log',
} as const;

export type ObjectOperationType = typeof ObjectOperation[keyof typeof ObjectOperation];
export type WhoseActionsType = typeof WhoseActions[keyof typeof WhoseActions];
export type EntityTypeType = typeof EntityType[keyof typeof EntityType];