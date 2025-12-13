exports.up = (pgm) => {
    pgm.createTable('positions', {
        position_id: {
            type: 'SERIAL',
            primaryKey: true
        },
        name: {
            type: 'VARCHAR(255)',
            notNull: true
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

    pgm.createIndex('positions', 'name');
};

exports.down = (pgm) => {
    pgm.dropTable('positions');
};