exports.up = (pgm) => {
  pgm.createTable('department', {
    id_department: {
      type: 'SERIAL',
      primaryKey: true
    },
    organization_id: {
      type: 'INTEGER',
      notNull: true
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
  });


  pgm.addConstraint('departments', 'fk_departments_organization', {
    foreignKeys: {
      columns: 'organization_id',
      references: 'organizations(id)',
      onDelete: 'RESTRICT'
    }
  });

  pgm.addConstraint('departments', 'fk_departments_parent', {
    foreignKeys: {
      columns: 'parent_id',
      references: 'departments(id_department)',
      onDelete: 'RESTRICT'
    }
  });

  pgm.createIndex('departments', 'organization_id');
  pgm.createIndex('departments', 'parent_id');
  pgm.createIndex('departments', 'name');
};

exports.down = (pgm) => {
  pgm.dropTable('department', { cascade: true });
};