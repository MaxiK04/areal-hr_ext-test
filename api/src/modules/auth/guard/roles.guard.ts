import { Injectable, CanActivate, ExecutionContext, ForbiddenException,UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const method = request.method;

        if (!user) {
            throw new UnauthorizedException('Требуется авторизация');
        }

        const userRole = user.role;

        if (userRole === 'admin') {
            return true;
        }

        if (userRole === 'user' && method === 'GET') {
            return true;
        }
        throw new ForbiddenException('Недостаточно прав. Требуется роль admin');
    }
}