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

  //POST users/auth/sign-up (route publique)
  //En tant qu'employé, je veux pouvoir m'inscrire sur le portail afin de pouvoir gérer mon planning ainsi que celui de mon équipe.
  //Notes du lead-developper: Pour cette route, tu dois prendre en compte le username, le password et l'email de l'utilisateur.
  //Afin de garantir la validation des données, tu vas devoir mettre en place une validation des paramètres.
  //Il faudrait un mot de passe d'au moins 8 caractères, un email bien formatté et un username d'au moins 3 caractères.
  //Attention à bien gérer l'attribution des roles, ce dernier est facultatif dans la route.
  //Penses à ne jamais renvoyer le mot de passe des utilisateurs, sur aucune route, sinon le patron ne va vraiment pas être content...
  //Mais surtout n'oublie pas de hasher le mot de passe

  // Parametres (body) :

  // username!: string;
  // password!: string;
  // email!: string;
  // role?: 'Employee' | 'Admin' | 'ProjectManager';
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

  //POST users/auth/login (route publique)
  //En tant qu'employé,
  //je veux pouvoir me connecter sur le portail afin de pouvoir accéder à toutes les fonctionnalités qui necessitent une authentification.

  //Tu dois gérer une authentification par email / mot de passe.
  //Ah et penses bien à renvoyer le JWT dans un objet contenant la clé access_token pour que le développeur front-end
  //puisse le stocker de son côté et te le renvoyer dans chaque requête qui auront besoin d'une authentification pour fonctionner.

  // Parametres (body) :

  // email!: string;
  // password!: string;

  @HttpCode(HttpStatus.CREATED)
  @Post('auth/login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() UserLogInDto: UserLogInDto) {
    return this.authService.signIn(UserLogInDto.email, UserLogInDto.password);
  }

  //GET users/
  //En tant qu'employé, je veux pouvoir voir la liste de tous les utilisateurs actuellement inscrits sur la plateforme
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

  //GET users/me
  //En tant qu'employé, je dois pouvoir afficher,
  //sur la plateforme, mes informations personnelles afin de me rappeler que je suis connecté.

  //Tu peux utiliser le token d'authentification de la requête pour identifier la personne actuellement connectée.

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req) {
    const user = req.user;
    return this.usersService.findOneById(user.userId);
  }

  //GET users/:id
  //En tant qu'employé, je veux pouvoir voir les informations personnelles d'un utilisateur de la plateforme en particulier.

  // Parametres (query) :

  // id!: string; //au format uuidv4
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
