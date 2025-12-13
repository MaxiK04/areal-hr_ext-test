import * as Joi from 'joi';

export const CreateFileSchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).required(),
    employee_id: Joi.number().min(1).required(),
    file_data: Joi.string().trim().required(),
});