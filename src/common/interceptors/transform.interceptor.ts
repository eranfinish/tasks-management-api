import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

/**
 * מבנה התגובה הסטנדרטי
 */
export interface Response<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  /**
   * עוטף את התגובה במבנה סטנדרטי
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

/* {
  "success": true,
  "data": {
    "total": 10,
    "byStatus": { "OPEN": 5, "IN_PROGRESS": 3, "DONE": 2 },
    "byPriority": { "LOW": 3, "MEDIUM": 4, "HIGH": 3 }
  },
  "timestamp": "..."
} */
