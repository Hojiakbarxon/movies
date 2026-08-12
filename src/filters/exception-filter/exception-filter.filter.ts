import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
export class ExceptionFilterFilter<T> implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) { }
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error!';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null && "message" in res) {
        message = (res as any).message
      }
    };

    if (status === HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error) {
      this.logger.error(exception.message, {
        stack: exception.stack,
        path: request.url,
        method: request.method
      });
    }

    response.status(status).json({
      statusCode: status,
      message,
      data: {
        path: request.url,
        time: new Date().toISOString()
      }
    });
  }
}
