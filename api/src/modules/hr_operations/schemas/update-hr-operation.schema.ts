import * as Joi from 'joi';

export const UpdateHrOperationSchema = Joi.object({
    salary: Joi.number()
        .precision(2)
        .positive()
        .when('type', {
            is: Joi.valid('hire', 'transfer', 'salary_change', 'dismissal', 'salary_change'),
            then: Joi.optional(),
            otherwise: Joi.optional(),
        }),
});