import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IdentityService } from 'src/modules/indentity/identity.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private identitySerivce: IdentityService,
    private userService: UserService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const roles = this.reflector.get<string[]>('roles', context.getClass());

    if (!roles) {
      return true;
    }

    try {
      const sub = request.auth.payload.sub;
      const identity = await this.identitySerivce.findByProviderId(sub);
      const user = await this.userService.findById(identity.user._id);
      request.user = user;

      return roles.includes(user.role);
    } catch (err) {
      return false;
    }
  }
}
