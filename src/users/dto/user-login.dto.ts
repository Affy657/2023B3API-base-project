import { IsEmail, IsString, MinLength } from 'class-validator';
export class UserLogInDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  @IsString()
  password!: string;
}
