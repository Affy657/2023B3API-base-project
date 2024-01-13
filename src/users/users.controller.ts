import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserSignUpDto } from './dto/user-signup.dto';
import { UserLogInDto } from './dto/user-login.dto';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('auth/sign-up')
  @UsePipes(new ValidationPipe({ transform: true }))
  async signUp(@Body() signUpDto: UserSignUpDto) {
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
    const user = await this.usersService.createUser({
      ...signUpDto,
      password: hashedPassword,
      role: signUpDto.role || 'Employee',
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    delete user.password;
    return user;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('auth/login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() UserLogInDto: UserLogInDto) {
    return this.authService.signIn(UserLogInDto.email, UserLogInDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    const user = req.user;
    if (user.role === 'Employee') {
      return this.usersService.findAll();
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req) {
    const user = req.user;
    return this.usersService.findOneById(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string, @Req() req) {
    const user = req.user;
    if (user.role === 'Employee') {
      return this.usersService.findOneById(id);
    } else {
      throw new UnauthorizedException();
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
