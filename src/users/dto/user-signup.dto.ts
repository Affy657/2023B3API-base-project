import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class UserSignUpDto {
  @IsString({ message: 'username should not be empty' })
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  role?: 'Employee' | 'Admin' | 'ProjectManager';
}
