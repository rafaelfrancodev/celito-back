import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './auth-roles.decorator';

@Injectable()
export class AuthAuthorizationRolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
        const request = context.switchToHttp().getRequest();
        const { user, params } = request;

        if (!requiredRoles) {
            return true;
        }

        if (user.role === 'admin') {
            return true;
        }

        if (requiredRoles.includes('user')) {
            const userIdFromParams = parseInt(params.id, 10);
            if (user.userId !== userIdFromParams) {
                throw new ForbiddenException('You can only access your own data');
            }
        }

        return true;
    }
}
