// users/users.service.ts
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly databaseService: DatabaseService) {}
    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
    async findAll(): Promise<User[]> {
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
        return result.rows as User[];
    }
    async findOne(id: number): Promise<User> {
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

        if (result.rows.length === 0) {
            throw new NotFoundException(`Пользователь с ID ${id} не найден`);
        }

        return result.rows[0] as User;
    }
    async findByLogin(login: string): Promise<User | null> {
        const query = `
            SELECT * FROM "user" 
            WHERE login = $1 AND deleted_at IS NULL
        `;
        const result = await this.databaseService.query(query, [login]);
        return result.rows[0] as User || null;
    }
    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.findByLogin(createUserDto.login);
        if (existingUser) {
            throw new ConflictException(`Логин '${createUserDto.login}' уже занят`);
        }
        const hashedPassword = await this.hashPassword(createUserDto.password);
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
        try {
            const result = await this.databaseService.query(query, [
                createUserDto.second_name,
                createUserDto.name,
                createUserDto.last_name || null,
                createUserDto.login,
                hashedPassword,
                createUserDto.role || 'user'
            ]);
            return result.rows[0] as User;
        } catch (error) {
            console.error('Error creating user:', error);
            throw new InternalServerErrorException('Не удалось создать пользователя');
        }
    }
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        await this.findOne(id);
        if (updateUserDto.login) {
            const existingUser = await this.findByLogin(updateUserDto.login);
            if (existingUser && existingUser.id_user !== id) {
                throw new ConflictException(`Логин '${updateUserDto.login}' уже занят`);
            }
        }
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (updateUserDto.second_name !== undefined) {
            fields.push(`second_name = $${paramIndex}`);
            values.push(updateUserDto.second_name);
            paramIndex++;
        }
        if (updateUserDto.name !== undefined) {
            fields.push(`name = $${paramIndex}`);
            values.push(updateUserDto.name);
            paramIndex++;
        }
        if (updateUserDto.last_name !== undefined) {
            fields.push(`last_name = $${paramIndex}`);
            values.push(updateUserDto.last_name || null);
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
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        if (fields.length === 1) { // Только updated_at
            throw new Error('Нет полей для обновления');
        }
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
            return result.rows[0] as User;
        } catch (error) {
            console.error('Error updating user:', error);
            throw new InternalServerErrorException('Не удалось обновить пользователя');
        }
    }

    async remove(id: number): Promise<boolean> {
        await this.findOne(id);
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

    async findDeleted(): Promise<User[]> {
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
        return result.rows as User[];
    }
    async validateUser(login: string, password: string): Promise<User | null> {
        const user = await this.findByLogin(login);

        if (!user) {
            return null;
        }
        const isPasswordValid = await this.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    }
}