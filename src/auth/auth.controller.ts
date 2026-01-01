import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Signup endpoint - יצירת משתמש חדש
   * POST /auth/signup
   */
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  /**
   * Login endpoint - התחברות משתמש
   * POST /auth/login
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
