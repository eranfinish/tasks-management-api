import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * מתעד את הבקשות והתגובות עם זמן ביצוע
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    // לוג לפני הבקשה
    console.log(`→ ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        // לוג אחרי התגובה
        const duration = Date.now() - now;
        console.log(`← ${method} ${url} - ${duration}ms`);
      }),
    );
  }
}
