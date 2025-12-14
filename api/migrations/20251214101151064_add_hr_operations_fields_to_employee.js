exports.up = (pgm) => {
    pgm.addColumns('employees', {
        hr_status: {
            type: 'VARCHAR(50)',
            default: 'INACTIVE'
        },
        current_department_id: {
            type: 'INTEGER',
            references: 'departments(department_id)',
            onDelete: 'SET NULL'
        },
        current_position_id: {
            type: 'INTEGER',
            references: 'positions(position_id)',
            onDelete: 'SET NULL'
        },
        current_salary: {
            type: 'DECIMAL(10,2)'
        }
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('employees', [
        'hr_status',
        'current_department_id',
        'current_position_id',
        'current_salary'
    ]);
};