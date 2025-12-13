exports.up = (pgm) => {
    pgm.createTable('files', {
        file_id: {
            type: 'SERIAL',
            primaryKey: true
        },
        name: {
            type: 'VARCHAR(255)',
            notNull: true
        },
        file_data: {
            type: 'bytea',
            notNull: true
        },
        employee_id: {
            type: 'INTEGER',
            notNull: true,
            references: 'employees(employee_id)'
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

    pgm.addConstraint('files', 'fk_files_employee', {
        foreignKeys: {
            columns: 'employee_id',
            references: 'employees(employee_id)',
            onDelete: 'CASCADE'
        }
    });

};

exports.down = (pgm) => {
    pgm.dropTable('files');
};