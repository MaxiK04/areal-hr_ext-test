
import * as Joi from 'joi';
import { EmployeeStatus } from '../../hr_operations/enums/employee-status.enum';

export const UpdateEmployeeSchema = Joi.object({
    second_name: Joi.string().optional(),
    name: Joi.string().optional(),
    last_name: Joi.string().allow('').optional(),
    birth_date: Joi.string().optional(),
    passport_serial: Joi.string().optional(),
    passport_number: Joi.string().optional(),
    passport_date: Joi.string().optional(),
    passport_code: Joi.string().optional(),
    passport_by: Joi.string().optional(),
    registration_region: Joi.string().optional(),
    registration_city: Joi.string().optional(),
    registration_street: Joi.string().optional(),
    registration_house: Joi.string().optional(),
    registration_korp: Joi.string().allow('').optional(),
    registration_apart: Joi.string().allow('').optional(),
    hr_status: Joi.string()
        .valid(...Object.values(EmployeeStatus))
        .optional()
});