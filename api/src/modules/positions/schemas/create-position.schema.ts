import * as Joi from 'joi';

export const CreatePositionSchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).required(),
});