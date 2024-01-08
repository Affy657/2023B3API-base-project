import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { UpdateProjectUserDto } from './dto/update-project-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ProjectUser } from './entities/project-user.entity';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectUsersService {
  constructor(
    @InjectRepository(ProjectUser)
    private readonly projectUserRepository: Repository<ProjectUser>,
    private readonly projectsService: ProjectsService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}

  async findAll() {
    // je veux pouvoir voir toutes les assignations des employés aux différents projets.
    return await this.projectUserRepository.find({});
  }

  async findAllByUserId(id: string) {
    console.log(id, 'id');
    // je veux pouvoir voir toutes mes assignations aux différents projets.
    const projectsUser = await this.projectUserRepository.find({
      where: { id: id },
      relations: { project: true },
    });
    if (!projectsUser) {
      throw new NotFoundException(`projectUser not found`);
    }
    return projectsUser;
  }

  async findOneById(id: string, userId?: string) {
    // je veux pouvoir voir une de mes assignations.
    const projectUser = await this.projectUserRepository.findOne({
      where: { id: id },
    });
    if (!projectUser) {
      throw new NotFoundException(`projectUser not found`);
    }
    if (userId && projectUser.userId !== userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return projectUser;
  }

  async create(createProjectUserDto: CreateProjectUserDto) {
    // je dois pouvoir assigner un employé à un projet pour une durée determinée si
    // ce dernier n'est pas déja affecté à un autre projet en même temps.

    const project = await this.projectsService.findOneById(
      createProjectUserDto.projectId,
    );
    if (!project) {
      throw new NotFoundException(`Project not found`);
    }

    const user = await this.usersService.findOneById(
      createProjectUserDto.userId,
    );
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const overlappingAssignment = await this.projectUserRepository.findOne({
      where: {
        userId: createProjectUserDto.userId,
        startDate: LessThanOrEqual(createProjectUserDto.endDate),
        endDate: MoreThanOrEqual(createProjectUserDto.startDate),
      },
      relations: { project: true },
    });
    if (overlappingAssignment) {
      throw new ConflictException(
        `User is already assigned to another project during the specified period.`,
      );
    }

    const projectUser = this.projectUserRepository.create(createProjectUserDto);
    const savedProjectUser = await this.projectUserRepository.save(projectUser);
    savedProjectUser.project = project;
    savedProjectUser.project.referringEmployee = user;
    savedProjectUser.user = user;
    console.log(savedProjectUser, 'savedProjectUser');
    return savedProjectUser;
  }

  update(id: number, updateProjectUserDto: UpdateProjectUserDto) {
    return `This action updates a #${id} projectUser #${updateProjectUserDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectUser`;
  }
}
