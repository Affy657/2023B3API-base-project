import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  Entity,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class ProjectUser extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string; //au format uuidv4

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column()
  projectId!: string; //au format uuidv4

  @Column()
  userId!: string; //au format uuidv4

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  public project: Project;
  user: import("c:/Users/adrie/Desktop/Ynov_B3/Dev_API/2023B3API-base-project/src/users/entities/user.entity").User;
}
