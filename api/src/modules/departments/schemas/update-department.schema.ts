import * as Joi from 'joi';

export const UpdateDepartmentSchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).optional(),
    comment: Joi.string().trim().allow('').optional(),
});