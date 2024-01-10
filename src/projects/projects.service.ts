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
  async findForUser(userId: string) {
    const projectUsers =
      await this.projectUsersService.findAllProjectUserByUserId(userId);
    const projectIds = projectUsers.map((projectUser) => projectUser.projectId);
    const projects = [];

    for (let i = 0; i < projectIds.length; i++) {
      const project = await this.projectRepository.findOne({
        where: { id: projectIds[i] },
        relations: {
          referringEmployee: true,
        },
      });

      if (project && project.referringEmployee) {
        delete project.referringEmployee.password;
      }
      projects[i] = project;
    }
    return projects;
  }

  // je veux pouvoir voir uniquement la liste de tous les projets de l'entreprise dans lesquels je suis impliqué
  // async findForUser(userId: string) {
  //   const projectUsers = await this.projectUsersService.findAllByUserId(userId);
  //   const projects = await this.projectRepository.find({
  //     where: { referringEmployeeId: userId },
  //     relations: {
  //       referringEmployee: true,
  //     },
  //   });
  //   projects.forEach((project) => {
  //     if (project && project.referringEmployee) {
  //       delete project.referringEmployee.password;
  //     }
  //   });
  //   return projects;
  // }

  async findOneById(id: string, userId?: string) {
    const project = await this.projectRepository.findOne({
      where: { id: id },
    });
    if (!project) {
      throw new NotFoundException(`projectUser not found`);
    }
    if (userId && project.referringEmployeeId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }
    return project;
  }

  async findOneByIdAndUserId(projectId: string, userId: string) {
    if (
      !(await this.projectUsersService.findOneProjectUserByUserIdAndProjectId(
        projectId,
        userId,
      ))
    ) {
      throw new ForbiddenException('Unauthorized');
    }
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`projectUser not found`);
    }
    console.log(
      await this.projectUsersService.findOneProjectUserByUserIdAndProjectId(
        projectId,
        userId,
      ),
    );
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
