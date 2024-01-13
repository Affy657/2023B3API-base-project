import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelectByString, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    const select: FindOptionsSelectByString<User> = [
      'id',
      'email',
      'role',
      'username',
    ];
    return this.userRepository.find({
      select,
    });
  }

  async findOneById(id: string): Promise<User> {
    const select: FindOptionsSelectByString<User> = [
      'id',
      'email',
      'role',
      'username',
    ];
    const userv = await this.userRepository.findOne({
      where: { id: id },
      select,
    });
    if (userv) {
      return userv;
    }
    throw new NotFoundException(`User with id ${id} not found`);
  }

  async findOne(email: string, needPwd?: boolean): Promise<User> {
    const select: FindOptionsSelectByString<User> = [
      'id',
      'email',
      'role',
      'username',
    ];

    if (needPwd) {
      select.push('password');
    }

    const user = await this.userRepository.findOne({
      where: { email: email },
      select,
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
