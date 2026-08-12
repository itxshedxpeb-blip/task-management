import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { FastifyRequest } from 'fastify';
import { MetricsService } from '../../modules/monitoring/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly metricsService?: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const { method, url } = request;
    const requestId = request.requestId || 'unknown';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const delay = Date.now() - now;

          this.logger.log(
            `${method} ${url} - RequestId: ${requestId} - Status: ${statusCode} - ${delay}ms`,
          );

          this.metricsService?.record({ method, url, statusCode, durationMs: delay, timestamp: Date.now() });
        },
        error: (error) => {
          const delay = Date.now() - now;
          const statusCode = error?.status || error?.response?.status || 500;

          this.logger.error(
            `${method} ${url} - RequestId: ${requestId} - Error: ${error.message} - ${delay}ms`,
          );

          this.metricsService?.record({ method, url, statusCode, durationMs: delay, timestamp: Date.now() });
        },
      }),
    );
  }
}
