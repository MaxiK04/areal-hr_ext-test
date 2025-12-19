import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserWithoutPassword } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly databaseService: DatabaseService) {}

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    async findByLogin(login: string): Promise<any> {
        const query = `SELECT * FROM "user" WHERE login = $1 AND deleted_at IS NULL`;
        const result = await this.databaseService.query(query, [login]);
        return result.rows[0] || null;
    }

    async findOneByLogin(login: string): Promise<any> {
        return this.findByLogin(login);
    }

    async findById(id: number): Promise<any> {
        const query = `
            SELECT 
              id_user, 
              second_name, 
              name, 
              last_name, 
              login, 
              role, 
              created_at, 
              updated_at
            FROM "user" 
            WHERE id_user = $1 AND deleted_at IS NULL
        `;
        const result = await this.databaseService.query(query, [id]);
        return result.rows[0] || null;
    }

    async findOne(id: number): Promise<any> {
        return this.findById(id);
    }

    async create(createUserDto: CreateUserDto): Promise<any> {
        const existingUser = await this.findByLogin(createUserDto.login);
        if (existingUser) {
            throw new ConflictException('Пользователь с таким логином уже существует');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        console.log('Создание пользователя:', createUserDto.login, 'пароль хэширован');

        const query = `
            INSERT INTO "user" (
                second_name,
                name,
                last_name,
                login,
                password,
                role
            )
            VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING 
                id_user, 
                second_name, 
                name, 
                last_name, 
                login, 
                role, 
                created_at, 
                updated_at
        `;

        const values = [
            createUserDto.second_name || '',
            createUserDto.name,
            createUserDto.last_name || '',
            createUserDto.login,
            hashedPassword,
            createUserDto.role || 'user'
        ];

        console.log('Параметры SQL:', values);

        try {
            const result = await this.databaseService.query(query, values);
            console.log('Пользователь создан:', result.rows[0]);
            return result.rows[0];
        } catch (error) {
            console.error('Ошибка создания пользователя:', error.message);
            throw new InternalServerErrorException('Failed to create user: ' + error.message);
        }
    }

    async findAll(): Promise<any[]> {
        const query = `
            SELECT
                id_user,
                second_name,
                name,
                last_name,
                login,
                role,
                created_at,
                updated_at
            FROM "user"
            WHERE deleted_at IS NULL
            ORDER BY id_user
        `;

        const result = await this.databaseService.query(query);
        return result.rows;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {

        const existingUser = await this.findById(id);
        if (!existingUser) {
            throw new NotFoundException(`Пользователь с ID ${id} не найден`);
        }

        if (updateUserDto.login && updateUserDto.login !== existingUser.login) {
            const userWithSameLogin = await this.findByLogin(updateUserDto.login);
            if (userWithSameLogin) {
                throw new ConflictException(`Логин '${updateUserDto.login}' уже занят`);
            }
        }

        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (updateUserDto.second_name !== undefined) {
            fields.push(`second_name = $${paramIndex}`);
            values.push(updateUserDto.second_name || '');
            paramIndex++;
        }

        if (updateUserDto.name !== undefined) {
            fields.push(`name = $${paramIndex}`);
            values.push(updateUserDto.name);
            paramIndex++;
        }

        if (updateUserDto.last_name !== undefined) {
            fields.push(`last_name = $${paramIndex}`);
            values.push(updateUserDto.last_name || '');
            paramIndex++;
        }

        if (updateUserDto.login !== undefined) {
            fields.push(`login = $${paramIndex}`);
            values.push(updateUserDto.login);
            paramIndex++;
        }

        if (updateUserDto.password !== undefined) {
            const hashedPassword = await this.hashPassword(updateUserDto.password);
            fields.push(`password = $${paramIndex}`);
            values.push(hashedPassword);
            paramIndex++;
        }

        if (updateUserDto.role !== undefined) {
            fields.push(`role = $${paramIndex}`);
            values.push(updateUserDto.role);
            paramIndex++;
        }

        if (fields.length === 0) {
            throw new Error('Нет полей для обновления');
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE "user" 
            SET ${fields.join(', ')}
            WHERE id_user = $${paramIndex} AND deleted_at IS NULL
            RETURNING 
                id_user, 
                second_name, 
                name, 
                last_name, 
                login, 
                role, 
                created_at, 
                updated_at
        `;

        try {
            const result = await this.databaseService.query(query, values);

            if (result.rows.length === 0) {
                throw new NotFoundException(`Пользователь с ID ${id} не найден`);
            }

            return result.rows[0];
        } catch (error) {
            console.error('Error updating user:', error);
            throw new InternalServerErrorException('Не удалось обновить пользователя');
        }
    }

    async remove(id: number): Promise<boolean> {
        const existingUser = await this.findById(id);
        if (!existingUser) {
            throw new NotFoundException(`Пользователь с ID ${id} не найден`);
        }

        const query = `
            UPDATE "user" 
            SET deleted_at = CURRENT_TIMESTAMP 
            WHERE id_user = $1 AND deleted_at IS NULL
            RETURNING id_user
        `;

        const result = await this.databaseService.query(query, [id]);
        return result.rowCount > 0;
    }

    async restore(id: number): Promise<boolean> {
        const query = `
            UPDATE "user"
            SET deleted_at = NULL
            WHERE id_user = $1 AND deleted_at IS NOT NULL
                RETURNING id_user
        `;

        const result = await this.databaseService.query(query, [id]);
        return result.rowCount > 0;
    }

    async findDeleted(): Promise<any[]> {
        const query = `
            SELECT
                id_user,
                second_name,
                name,
                last_name,
                login,
                role,
                created_at,
                updated_at,
                deleted_at
            FROM "user"
            WHERE deleted_at IS NOT NULL
            ORDER BY deleted_at DESC
        `;

        const result = await this.databaseService.query(query);
        return result.rows;
    }

    async validateUser(login: string, password: string): Promise<any> {
        const user = await this.findByLogin(login);

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }

        return null;
    }
}