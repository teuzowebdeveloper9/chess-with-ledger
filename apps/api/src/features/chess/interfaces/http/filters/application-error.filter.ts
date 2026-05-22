import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { ApplicationError } from '../../../application/errors/application.error';

interface JsonResponse {
  readonly status: (statusCode: number) => JsonResponse;
  readonly json: (body: unknown) => void;
}

@Catch(ApplicationError)
export class ApplicationErrorFilter implements ExceptionFilter {
  catch(exception: ApplicationError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<JsonResponse>();
    response.status(exception.statusCode).json({
      code: exception.code,
      message: exception.message,
      details: exception.details
    });
  }
}
