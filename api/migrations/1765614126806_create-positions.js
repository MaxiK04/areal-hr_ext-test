exports.up = (pgm) => {
    pgm.sql(`
    CREATE TABLE positions (
      position_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ NULL
    );
  `);
};

exports.down = (pgm) => {
    pgm.sql(`DROP TABLE positions;`);
};