import * as Joi from 'joi';

export const CreateOrganizationSchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).required(),
    comment: Joi.string().trim().allow('').max(255).optional(),
});