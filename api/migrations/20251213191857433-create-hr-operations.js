exports.up = (pgm) => {
    pgm.createTable('hr_operations', {
        id: {
            type: 'SERIAL',
            primaryKey: true,
        },
        employee_id: {
            type: 'INTEGER',
            notNull: true,
            references: 'employees(id)',
            onDelete: 'RESTRICT',
        },
        department_id: {
            type: 'INTEGER',
            references: 'departments(id)',
            onDelete: 'RESTRICT',
        },
        position_id: {
            type: 'INTEGER',
            references: 'positions(id)',
            onDelete: 'RESTRICT',
        },
        set_salary: {
            type: 'DECIMAL(10,2)',
        },
        type_action: {
            type: 'VARCHAR(20)',
            notNull: true,
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
        }
    });
    pgm.addConstraint('hr_operation', 'fk_hr_operations_employee', {
        foreignKeys: {
            columns: 'employee_id',
            references: 'employees(id_employee)',
            onDelete: 'CASCADE'
        }
    });
    pgm.addConstraint('hr_operation', 'fk_hr_operations_department', {
        foreignKeys: {
            columns: 'department_id',
            references: 'department(id_department)',
            onDelete: 'CASCADE'
        }
    });
    pgm.addConstraint('hr_operation', 'fk_hr_operations_position', {
        foreignKeys: {
            columns: 'position_id',
            references: 'position(position_id)',
            onDelete: 'CASCADE'
        }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('hr_operations');
};