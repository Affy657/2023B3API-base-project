import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ProjectUsersService } from './project-users.service';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { UpdateProjectUserDto } from './dto/update-project-user.dto';
import { UsersService } from '../users/users.service';
import { ProjectUser } from './entities/project-user.entity';
import { JwtAuthGuard } from '../jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('project-users')
export class ProjectUsersController {
  constructor(
    private readonly projectUsersService: ProjectUsersService,
    private readonly usersService: UsersService,
  ) {}

  //GET /project-users
  //En tant qu'Administrateurs ou Chef de projet, je veux pouvoir voir toutes les assignations des employés aux différents projets.
  //En tant qu'Employé, je veux pouvoir voir toutes mes assignations aux différents projets.
  @Get()
  async findAll(@Req() request): Promise<ProjectUser[]> {
    // Assumer que request.user contient les informations de l'utilisateur
    const user = request.user;
    if (user.role === 'Admin' || user.role === 'ProjectManager') {
      return this.projectUsersService.findAll();
    } else {
      return this.projectUsersService.findAllByUserId(user.userId);
    }
  }

  //GET /project-users/:id
  //En tant qu'Administrateurs ou Chef de projet, je veux pouvoir voir une assignation en particulier.
  //En tant qu'Employé, je veux pouvoir voir une de mes assignations.
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request) {
    const user = request.user;
    if (user.role === 'Admin' || user.role === 'ProjectManager') {
      return await this.projectUsersService.findOneById(id);
    } else {
      return await this.projectUsersService.findOneById(user.userId, id);
    }
  }
  //POST /project-users
  //En tant qu'Administrateurs ou Chef de projet,
  //je dois pouvoir assigner un employé à un projet pour une durée determinée si
  //ce dernier n'est pas déja affecté à un autre projet en même temps.
  //
  //Notes du lead-developper : Dans le cas où l'employé est déjà affecté à un projet pour la période demandée,
  //tu dois me renvoyer une ConflictException. Tout comme dans les autres routes,
  //si un utilisateur n'a pas les droits pour effectuer cette action, il faut que tu me renvoies une UnauthorizedException.
  //Pour que le portail puisse afficher une modale de succès, il faudrait que tu m'inclues les relations user,
  //project et referringEmployee de project dans le retour de la route.

  @Post()
  async create(
    @Body() createProjectUserDto: CreateProjectUserDto,
    @Req() request,
  ) {
    const user = request.user;
    if (user.role === 'Employee') {
      throw new UnauthorizedException();
    } else {
      return this.projectUsersService.create(createProjectUserDto);
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectUserDto: UpdateProjectUserDto,
  ) {
    return this.projectUsersService.update(+id, updateProjectUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectUsersService.remove(+id);
  }
}
