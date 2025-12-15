export class CreateUserDto {
    second_name: string;
    name: string;
    last_name?: string;
    login: string;
    password: string;
    role?: string;
}