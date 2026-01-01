import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/enitities/user.entity';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

    // 🔐 Signup - יצירת משתמש חדש
  async signup(signupDto: SignupDto) {
    // 1. הצפן את הסיסמה
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    // 2. צור משתמש עם סיסמה מוצפנת
    const user = await this.usersService.create({
      ...signupDto,
      password: hashedPassword,
    });

    // 3. החזר Token
    return this.generateToken(user);
  }

  // 🔑 Login - התחברות
  async login(loginDto: LoginDto) {
    // 1. מצא את המשתמש
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('שם משתמש או סיסמה שגויים');
    }

    // 2. בדוק את הסיסמה
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('שם משתמש או סיסמה שגויים');
    }

    // 3. החזר Token
    return this.generateToken(user);
  }

  // 🪙 יצירת JWT Token
  private generateToken(user: User) {
    const payload = {
      sub: user.id,         // "sub" = subject (המשתמש)
      username: user.username
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    };
  }
}
