import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Custom AuthGuard implementation
 * Validates JWT token from Authorization header
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify and decode the JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      });

      // Attach user info to request object
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
