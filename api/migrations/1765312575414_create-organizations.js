exports.up = (pgm) => {
    pgm.createTable('organization', {
        id_organization: {
            type: 'serial',
            primaryKey: true
        },
        name: {
            type: 'varchar(255)',
            notNull: true
        },
        comment: {
            type: 'text'
        },
        created_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp')
        },
        updated_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp')
        },
        deleted_at: {
            type: 'timestamp'
        }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('organization');
};