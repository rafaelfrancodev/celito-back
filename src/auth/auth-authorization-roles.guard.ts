import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './auth-roles.decorator';
import AuthRolesConstants from './auth-roles.constants';

@Injectable()
export class AuthAuthorizationRolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
        const request = context.switchToHttp().getRequest();
        const { user, params, body } = request;

        if (!requiredRoles) {
            return true;
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('You do not have permission to access this route');
        }

        if (user.role === AuthRolesConstants.ADMIN) {
            return true;
        }

        if (user.role === AuthRolesConstants.USER && params.id) {
            const userIdFromParams = parseInt(params.id, 10);

            if (user.userId !== userIdFromParams) {
                throw new ForbiddenException('You can only access or update your own data');
            }

            if (body && body.role && body.role !== user.role) {
                throw new ForbiddenException('You cannot change your role');
            }
        }

        return true;
    }
}
