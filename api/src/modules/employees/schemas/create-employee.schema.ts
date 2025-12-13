import * as Joi from 'joi';

export const CreateEmployeeSchema = Joi.object({
    second_name: Joi.string().trim().min(1).max(100).required(),
    name: Joi.string().trim().min(1).max(100).required(),
    last_name: Joi.string().trim().min(1).max(100).required(),
    birth_date: Joi.string()
        .pattern(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/)
        .required(),
    passport_serial: Joi.string().length(4).allow('').required(),
    passport_number: Joi.string().length(6).allow('').required(),
    passport_date: Joi.string()
        .pattern(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/)
        .allow('')
        .required(),
    passport_code: Joi.string().length(7).allow('').required(),
    passport_by: Joi.string().trim().max(500).allow('').required(),
    registration_region: Joi.string().trim().max(100).allow('').required(),
    registration_city: Joi.string().trim().max(100).allow('').required(),
    registration_street: Joi.string().trim().max(200).allow('').required(),
    registration_house: Joi.string().trim().max(20).allow('').required(),
    registration_korp: Joi.string().trim().allow('').required(),
    registration_apart: Joi.string().trim().allow('').required(),
});