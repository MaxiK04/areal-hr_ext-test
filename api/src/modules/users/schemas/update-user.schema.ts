import * as Joi from 'joi';

export const UpdateUserSchema = Joi.object({
    second_name: Joi.string().trim().min(1).max(100).optional(),
    name: Joi.string().trim().min(1).max(100).optional(),
    last_name: Joi.string().trim().allow('').max(100).optional(),
    login: Joi.string().trim().min(3).max(100).optional(),
    password: Joi.string().trim().min(6).max(255).optional(),
    role: Joi.string().valid('admin', 'manager', 'user').optional(),
}).min(1);