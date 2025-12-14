exports.up = (pgm) => {
  pgm.createTable('department', {
    id_department: {
      type: 'SERIAL',
      primaryKey: true
    },
    organization_id: {
      type: 'INTEGER',
      notNull: true,
      references: 'organizations(id_organization)',
      onDelete: 'RESTRICT'
    },
    name: {
      type: 'VARCHAR(255)',
      notNull: true
    },
    comment: {
      type: 'TEXT'
    },
    parent_id: {
      type: 'INTEGER'
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
    },{
    ifNotExists: true
  });



};

exports.down = (pgm) => {
  pgm.dropTable('department', { cascade: true });
};