import * as Joi from 'joi';

export const CreateHrOperationSchema = Joi.object({
    employee_id: Joi.number().required(),
    department_id: Joi.number().optional(),
    position_id: Joi.number().optional(),
    set_salary: Joi.number().optional(),
    type_action: Joi.string().valid('hire', 'transfer', 'salary_change', 'dismissal').required(),
});