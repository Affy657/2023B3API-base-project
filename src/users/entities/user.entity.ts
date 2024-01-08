import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  BaseEntity,
} from 'typeorm';

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
}
