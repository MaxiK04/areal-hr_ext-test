import { IsString, IsOptional, IsEnum } from 'class-validator';
import { EmployeeStatus } from '../../hr_operations/enums/employee-status.enum';

export class UpdateEmployeeDto {
    @IsOptional()
    @IsString()
    second_name?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    last_name?: string;

    @IsOptional()
    @IsString()
    birth_date?: string;

    @IsOptional()
    @IsString()
    passport_serial?: string;

    @IsOptional()
    @IsString()
    passport_number?: string;

    @IsOptional()
    @IsString()
    passport_date?: string;

    @IsOptional()
    @IsString()
    passport_code?: string;

    @IsOptional()
    @IsString()
    passport_by?: string;

    @IsOptional()
    @IsString()
    registration_region?: string;

    @IsOptional()
    @IsString()
    registration_city?: string;

    @IsOptional()
    @IsString()
    registration_street?: string;

    @IsOptional()
    @IsString()
    registration_house?: string;

    @IsOptional()
    @IsString()
    registration_korp?: string;

    @IsOptional()
    @IsString()
    registration_apart?: string;

    @IsOptional()
    @IsEnum(EmployeeStatus)
    hr_status?: EmployeeStatus;
}