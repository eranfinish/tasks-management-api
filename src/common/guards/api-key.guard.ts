import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  /**
   * בודק אם הבקשה מכילה API Key תקין
   * @param context - ההקשר של הבקשה
   * @returns true אם ה-API Key תקין, אחרת זורק UnauthorizedException
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers["x-api-key"] as string | undefined;
    const expectedApiKey = process.env.API_KEY;

    // וידוא שמפתח ה-API מוגדר בסביבה
    if (!expectedApiKey) {
      throw new UnauthorizedException(
        "API Key לא הוגדר בהגדרות הסביבה (API_KEY)",
      );
    }

    // בדיקת תקינות המפתח שהתקבל
    if (!apiKey) {
      throw new UnauthorizedException("חסר API Key בבקשה (x-api-key header)");
    }

    if (apiKey === expectedApiKey) {
      return true;
    }

    throw new UnauthorizedException("API Key לא תקין");
  }
}
