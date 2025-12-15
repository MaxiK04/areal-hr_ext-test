exports.up = (pgm) => {

    pgm.createTable('logs', {
        id_log: {
            type: 'SERIAL',
            primaryKey: true,
        },
        user_id: {
            type: 'INTEGER',
            notNull: true,
            references: 'employees(user_id)',
            onDelete: 'RESTRICT',
        },
        whose_actions: {
            type: 'VARCHAR(255)',
            notNull: true,
        },
        object_operation: {
            type: 'VARCHAR(255)',
            notNull: true,
        },
        new_field: {
            type: 'VARCHAR(255)',
            notNull: true,
        },
        old_field: {
            type: 'VARCHAR(255)',
            notNull: true,
        },
        created_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP')
        },
        updated_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP')
        },
        deleted_at: {
            type: 'TIMESTAMP'
        }
    });

    pgm.addConstraint('logs', 'fk_logs_employees', {
        foreignKeys: {
            columns: 'user_id',
            references: 'employees(user_id)',
            onDelete: 'RESTRICT'
        }
    });


    pgm.addConstraint('logs', 'fk_logs_user', {
        foreignKeys: {
            columns: 'user_id',
            references: 'user(id_user)',
            onDelete: 'RESTRICT'
        }
    });

    exports.down = (pgm) => {
        pgm.dropTable('logs');
    };