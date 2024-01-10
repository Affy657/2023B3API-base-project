import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  Entity,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;
}
