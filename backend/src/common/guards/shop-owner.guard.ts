import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class ShopOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const shopId = request.params.shopId || request.body.shopId;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      return true;
    }

    if (user.shopId && user.shopId === shopId) {
      return true;
    }

    throw new ForbiddenException('Accès refusé à cette boutique');
  }
}
