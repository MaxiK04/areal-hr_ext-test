import * as Joi from 'joi';

export const UpdateEmployeeSchema = Joi.object({
    second_name: Joi.string().trim().max(100).optional(),
    name: Joi.string().trim().max(100).optional(),
    last_name: Joi.string().trim().max(100).optional(),
    birth_date: Joi.string()
        .pattern(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/)
        .optional(),
    passport_serial: Joi.string().length(4).optional(),
    passport_number: Joi.string().length(6).optional(),
    passport_date: Joi.string()
        .pattern(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/)
        .optional(),
    passport_code: Joi.string().length(7).optional(),
    passport_by: Joi.string().trim().max(500).optional(),
    registration_region: Joi.string().trim().max(100).optional(),
    registration_city: Joi.string().trim().max(100).optional(),
    registration_street: Joi.string().trim().max(200).optional(),
    registration_house: Joi.string().trim().max(20).optional(),
    registration_korp: Joi.string().trim().allow('').optional(),
    registration_apart: Joi.string().trim().allow('').optional(),

});