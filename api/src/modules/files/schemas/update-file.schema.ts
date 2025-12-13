import * as Joi from 'joi';

export const UpdateFileSchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).optional(),
    employee_id: Joi.number().min(1).optional(),
});