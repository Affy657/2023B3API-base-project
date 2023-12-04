import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  BaseEntity,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
@Unique(['username'])
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // au format uuidv4

  @Column()
  username!: string; // cette propriété doit porter une contrainte d'unicité

  @Column()
  email!: string; // cette propriété doit porter une contrainte d'unicité

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: ['Employee', 'Admin', 'ProjectManager'],
    default: 'Employee',
  })
  role!: 'Employee' | 'Admin' | 'ProjectManager'; // valeur par defaut : 'Employee'

  // Si vous souhaitez générer automatiquement un UUID lors de la création d'un nouvel utilisateur :
  constructor() {
    super();
    this.id = uuidv4();
  }
}
