exports.up = (pgm) => {
    pgm.createTable('employees', {
        id_employee: {
            type: 'SERIAL',
            primaryKey: true
        },
        second_name: {
            type: 'VARCHAR(100)',
            notNull: true
        },
        name: {
            type: 'VARCHAR(100)',
            notNull: true
        },
        last_name: {
            type: 'VARCHAR(100)'
        },
        birth_date: {
            type: 'DATE',
            notNull: true
        },
        passport_serial: {
            type: 'VARCHAR(4)',
            notNull: true
        },
        passport_number: {
            type: 'VARCHAR(6)',
            notNull: true
        },
        passport_date: {
            type: 'DATE',
            notNull: true
        },
        passport_code: {
            type: 'VARCHAR(7)',
            notNull: true
        },
        passport_by: {
            type: 'VARCHAR(500)',
            notNull: true
        },
        registration_region: {
            type: 'VARCHAR(100)',
            notNull: true
        },
        registration_city: {
            type: 'VARCHAR(100)',
            notNull: true
        },
        registration_street: {
            type: 'VARCHAR(200)',
            notNull: true
        },
        registration_house: {
            type: 'VARCHAR(20)',
            notNull: true
        },
        registration_korp: {
            type: 'VARCHAR(20)'
        },
        registration_apart: {
            type: 'VARCHAR(20)'
        },
        passport_scan: {
            type: 'bytea'
        },
        created_at: {
            type: 'TIMESTAMPTZ',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP')
        },
        updated_at: {
            type: 'TIMESTAMPTZ',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP')
        },
        deleted_at: {
            type: 'TIMESTAMPTZ'
        },
        user_id: {
            type: 'INTEGER',
            references: 'users(user_id)',
            onDelete: 'SET NULL',
        }
    });


    pgm.addConstraint('operation', 'fk_operation_employee', {
        foreignKeys: {
            columns: 'employee_id',
            references: 'employees(id_employee)',
            onDelete: 'SET NULL'
        }
    });

    pgm.addConstraint('operation', 'fk_operation_department', {
        foreignKeys: {
            columns: 'department_id',
            references: 'departments(department_id)',
            onDelete: 'SET NULL'
        }
    });

    pgm.addConstraint('operation', 'fk_operation_position', {
        foreignKeys: {
            columns: 'position_id',
            references: 'positions(position_id)',
            onDelete: 'SET NULL'
        }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('employees');
};