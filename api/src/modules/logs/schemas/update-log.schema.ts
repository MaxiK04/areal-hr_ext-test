import * as Joi from 'joi';

export const UpdateLogSchema = Joi.object({
    whose_action: Joi.string().trim().min(1).max(50).optional(),
    object_operation: Joi.string().trim().min(1).max(100).optional(),
    old_value: Joi.string().trim().allow('').optional(),
    new_value: Joi.string().trim().min(1).optional(),
});