import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // au format uuidv4

  @Column()
  name!: string;

  @Column()
  referringEmployeeId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referringEmployeeId' })
  public referringEmployee: User;
}
