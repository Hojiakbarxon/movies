import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TimestampedEntity } from '../../utils/base.entity';
import { Countries } from '../../utils/Custom Types/countries-type';

@Entity('profiles')
export class Profile extends TimestampedEntity {
  @Column({ type: 'varchar', length: 100, nullable: true })
  full_name: string;

  // @Column({ type: 'varchar', length: 20, nullable: true })
  // phone: string;

  @Column({ type: 'enum', enum: Countries, nullable: true })
  country: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}