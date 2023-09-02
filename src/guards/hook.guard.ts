import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HookGuard implements CanActivate {
  constructor(private configService: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const clientId = request.headers.client_id ?? '';
    const clientIds = [
      this.configService.get<string>('AUTH0_WEB_CLIENT'),
      this.configService.get<string>('AUTH0_MOBILE_CLIENT'),
    ];

    console.log(
      '>>> Hook guard: ',
      clientId,
      clientIds.includes(clientId),
      clientIds,
    );

    return clientIds.includes(clientId);
  }
}
