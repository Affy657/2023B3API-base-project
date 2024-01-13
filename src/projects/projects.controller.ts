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

  @Get()
  async findAll(@Req() request) {
    const user = request.user;
    if (user.role === 'Admin' || user.role === 'ProjectManager') {
      return await this.projectsService.findAll();
    } else {
      return await this.projectsService.findForUser(user.userId);
    }
  }

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
