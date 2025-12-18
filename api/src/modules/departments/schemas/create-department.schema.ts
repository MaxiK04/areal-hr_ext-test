import * as Joi from 'joi';

export const CreateDepartmentSchema = Joi.object({
    organization_id: Joi.number().min(1).required(),
    name: Joi.string().trim().min(1).max(255).required(),
    parent_id: Joi.number().allow(null).optional(),
    comment: Joi.string().trim().allow('').required(),
});