import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Movie } from '../../movies/entities/movie.entity';
import { Favourites } from '../../favourites/entities/favourite.entity';
import { Reviews } from '../../movies/entities/reviews.entity';
import { TimestampedEntity } from '../../utils/base.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

@Entity('users')
export class User extends TimestampedEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Index('IDX_USER_EMAIL')
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar_url: string;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @OneToMany(() => Movie, (movies) => movies.created_by)
  movies: Movie[]

  @OneToMany(() => Favourites, (favourites) => favourites.user)
  favourites: Favourites[];
  
  @OneToMany(() => Reviews, (reviews) => reviews.user)
  reviews: Reviews[];
}