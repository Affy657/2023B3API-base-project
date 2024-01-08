import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ProjectUsersService } from '../project-users/project-users.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @Inject(forwardRef(() => ProjectUsersService))
    private readonly projectUsersService: ProjectUsersService,
  ) {}

  //je veux pouvoir voir la liste de tous les projets de l'entreprise
  async findAll() {
    const projects = await this.projectRepository.find({
      relations: {
        referringEmployee: true,
      },
    });
    projects.forEach((project) => {
      if (project && project.referringEmployee) {
        delete project.referringEmployee.password;
      }
    });
    return projects;
  }

  // je veux pouvoir voir uniquement la liste de tous les projets de l'entreprise dans lesquels je suis impliqué
  async findForUser(id: string) {
    const projectUsers = await this.projectUsersService.findAllByUserId(id);
    const projects = await this.projectRepository.find({
      where: { referringEmployeeId: id },
      relations: {
        referringEmployee: true,
      },
    });
    projects.forEach((project) => {
      if (project && project.referringEmployee) {
        delete project.referringEmployee.password;
      }
    });
    console.log(projects, 'projects');
    return projects;
  }

  // je veux pouvoir consulter un projet en particulier
  async findOneById(id: string, userId?: string) {
    const project = await this.projectRepository.findOne({
      where: { referringEmployeeId: id },
    });
    if (!project) {
      throw new NotFoundException(`projectUser not found`);
    }
    if (userId && project.referringEmployeeId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }
    return project;
  }

  async create(
    createProjectDto: CreateProjectDto,
    referringEmployee: User,
  ): Promise<Project> {
    createProjectDto.referringEmployeeId = referringEmployee.id;
    const project = await this.projectRepository.create(createProjectDto);
    await this.projectRepository.save(project);
    project.referringEmployee = referringEmployee;
    return project;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
