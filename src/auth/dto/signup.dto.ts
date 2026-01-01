import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  // סיסמה חייבת להיות לפחות 6 תווים
  password: string;
}