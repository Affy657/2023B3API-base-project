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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  //POST /projects
  //En tant qu'Administrateur,
  //je veux pouvoir créer un projet en renseignant un nom
  //et un référent qui doit être Administrateur ou Chef de projet.
  //Si une personne essaie de créer un projet sans être administrateur, il faut que tu me renvoies une UnauthorizedException. Fais en de même si la personne référente donnée n'est pas au minimum un chef de projet. Penses à mettre en place une validation sur ta route, il faut que le nom du projet contienne au moins 3 caractères. Pour que le portail puisse afficher une modale de succès, il faudrait que tu m'inclues la relation referringEmployee dans le retour de la route.
  //   Parametres (body) :

  // name!: string;
  // referringEmployeeId!: string; //au format uuidv4
  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() request) {
    const user = request.user;
    if (user.role === 'Admin') {
      const referringEmployee: User = await this.usersService.findOneById(
        createProjectDto.referringEmployeeId,
      );
      if (
        referringEmployee.role === 'Admin' ||
        referringEmployee.role === 'ProjectManager'
      ) {
        return await this.projectsService.create(
          createProjectDto,
          referringEmployee,
        );
      } else {
        throw new UnauthorizedException();
      }
    } else {
      throw new UnauthorizedException();
    }
  }

  //GET /projects
  //En tant qu'Administrateurs ou Chef de projet, je veux pouvoir voir la liste de tous les projets de l'entreprise.
  //En tant qu'Employé, je veux pouvoir voir uniquement la liste de tous les projets de l'entreprise dans lesquels je suis impliqué.
  @Get()
  async findAll(@Req() request) {
    const user = request.user;
    if (user.role === 'Admin' || user.role === 'ProjectManager') {
      return await this.projectsService.findAll();
    } else {
      return await this.projectsService.findForUser(user.userId);
    }
  }

  //GET /projects/:id
  //En tant qu'Administrateurs ou Chef de projet, je veux pouvoir consulter un projet en particulier.
  //En tant qu'Employé, je veux pouvoir voir un projet de l'entreprise dans lequel je suis impliqué.
  // Dans le cas où un utilisateur n'a pas le droit de consulter le projet demandé, il faudrait que tu me renvoies une ForbiddenError.

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request) {
    const user = request.user;
    if (user.role === 'Admin' || user.role === 'ProjectManager') {
      return await this.projectsService.findOneById(id);
    } else {
      return await this.projectsService.findOneByIdAndUserId(id, user.userId);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
