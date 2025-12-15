import * as Joi from 'joi';

export const LogSchema = Joi.object({
    user_id: Joi.number().integer().positive().required(),
    whose_actions: Joi.string().trim().min(1).max(255).required(),
    object_operation: Joi.number().integer().positive().required(),
    new_field: Joi.string().trim().min(1).max(255).required(),
    old_field: Joi.string().trim().min(1).max(255).required(),
});