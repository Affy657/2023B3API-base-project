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

  @Get()
  async findAll(@Req() request): Promise<ProjectUser[]> {
    const user = request.user;
    if (user.role === 'Admin' || user.role === 'ProjectManager') {
      return this.projectUsersService.findAll();
    } else {
      return this.projectUsersService.findAllByUserId(user.userId);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request) {
    const user = request.user;
    if (user.role === 'Admin' || user.role === 'ProjectManager') {
      return await this.projectUsersService.findOneById(id);
    } else {
      return await this.projectUsersService.findOneById(user.userId, id);
    }
  }

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
