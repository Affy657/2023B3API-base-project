import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
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
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}

  async findAll() {
    return await this.projectUserRepository.find({});
  }

  async findAllByUserId(id: string) {
    const projectsUser = await this.projectUserRepository.find({
      where: { id: id },
      relations: { project: true },
    });
    if (!projectsUser) {
      throw new NotFoundException(`projectUser not found`);
    }
    return projectsUser;
  }

  async findAllProjectUserByUserId(userId: string) {
    const projectsUser = await this.projectUserRepository.find({
      where: { userId: userId },
      relations: { project: true },
    });
    if (!projectsUser) {
      throw new NotFoundException(`projectUser not found`);
    }
    return projectsUser;
  }

  async findOneProjectUserByUserIdAndProjectId(
    projectId: string,
    userId: string,
  ) {
    const projectsUser = await this.projectUserRepository.findOne({
      where: {
        userId: userId,
        projectId: projectId,
      },
      relations: { project: true },
    });
    if (!projectsUser) {
      return null;
    }
    return projectsUser;
  }

  async findOneById(id: string, userId?: string) {
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
    return savedProjectUser;
  }

  update(id: number, updateProjectUserDto: UpdateProjectUserDto) {
    return `This action updates a #${id} projectUser #${updateProjectUserDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectUser`;
  }
}
