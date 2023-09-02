import {
  CallHandler,
  ExecutionContext,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const caller = context.getClass().name + '.' + context.getHandler().name;
    return next.handle().pipe(
      tap({
        next: (value) => {
          this.logger.log('Data', caller, value);
        },
        error: (err) => {
          this.logger.error('Error', err, caller);
        },
      }),
    );
  }
}
