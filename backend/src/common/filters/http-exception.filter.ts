import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { MonitoringService } from '../../modules/monitoring/monitoring.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly monitoringService?: MonitoringService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const isDatabaseUnavailable =
      exception instanceof Error &&
      (exception.message.includes("Can't reach database server") ||
        exception.message.includes('Server has closed the connection') ||
        exception.message.includes('Database is unavailable at'));

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : isDatabaseUnavailable
          ? HttpStatus.SERVICE_UNAVAILABLE
          : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? exception.message
        : isDatabaseUnavailable
          ? 'Database is temporarily unavailable'
          : 'Internal server error';

    const requestId = request.requestId || 'unknown';

    // Log detailed validation errors
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as { message?: unknown };
        if (responseObj.message && Array.isArray(responseObj.message)) {
          this.logger.error(
            `${request.method} ${request.url} - RequestId: ${requestId} - Status: ${status} - Validation Errors: ${JSON.stringify(responseObj.message)}`,
          );
          message = responseObj.message.join(', ');
        } else if (responseObj.message) {
          this.logger.error(
            `${request.method} ${request.url} - RequestId: ${requestId} - Status: ${status} - Error Details: ${JSON.stringify(responseObj)}`,
          );
        }
      }
    }

    this.logger.error(
      `${request.method} ${request.url} - RequestId: ${requestId} - Status: ${status} - Message: ${message}`,
    );

    // Record server-side errors (>=500) into the error audit log (fire-and-forget)
    if (status >= 500 && this.monitoringService) {
      const user = (request as FastifyRequest & { user?: { id?: string } }).user;
      this.monitoringService
        .recordError({
          requestId,
          userId: user?.id,
          source: 'backend',
          level: 'error',
          method: request.method,
          url: request.url,
          status,
          message,
          stackTrace: exception instanceof Error ? exception.stack : undefined,
          ipAddress: (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.ip,
          userAgent: request.headers['user-agent'],
        })
        .catch(() => undefined);
    }

    response.status(status).send({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
      message,
      errors: Array.isArray(message) ? message : message ? [message] : [],
    });
  }
}
