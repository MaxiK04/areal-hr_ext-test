export function buildUpdateQuery(tableName: string, changes: any, id: number) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(changes).forEach(([key, value]) => {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
    });

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
    UPDATE ${tableName} 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

    return { query, values };
}