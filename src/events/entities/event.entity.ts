import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  date!: Date;

  @Column({ default: 'Pending' })
  eventStatus?: 'Pending' | 'Accepted' | 'Declined';

  @Column()
  eventType!: 'RemoteWork' | 'PaidLeave';

  @Column()
  eventDescription?: string;

  @Column()
  userId!: string;
}
