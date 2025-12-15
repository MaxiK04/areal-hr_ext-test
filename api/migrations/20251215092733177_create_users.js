
exports.up = (pgm) => {
    pgm.createTable('user', {
        id_user: {
            type: 'SERIAL',
            primaryKey: true,
        },
        second_name: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
        name: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
        last_name: {
            type: 'VARCHAR(100)',
            notNull: false,
        },
        login: {
            type: 'VARCHAR(100)',
            notNull: true,
            unique: true,
        },
        password: {
            type: 'VARCHAR(255)',
            notNull: true,
        },
        role: {
            type: 'VARCHAR(50)',
            notNull: true,
            default: 'user',
        },
        created_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
        updated_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
        deleted_at: {
            type: 'TIMESTAMP',
            notNull: false,
        }
    });

};

exports.down = (pgm) => {
    pgm.dropTable('user');
};