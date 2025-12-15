import * as Joi from 'joi';

export const CreateUserSchema = Joi.object({
    second_name: Joi.string().trim().min(1).max(100).required(),
    name: Joi.string().trim().min(1).max(100).required(),
    last_name: Joi.string().trim().allow('').max(100).optional(),
    login: Joi.string().trim().min(3).max(100).required(),
    password: Joi.string().trim().min(6).max(255).required(),
    role: Joi.string().valid('admin', 'manager', 'user').default('user'),
});