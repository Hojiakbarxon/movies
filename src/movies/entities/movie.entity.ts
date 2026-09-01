import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MovieFile } from './movie-file.entity';
import { MovieCategory } from './movie-category.entity';
import { Favourites } from '../../favourites/entities/favourite.entity';
import { Reviews } from './reviews.entity';
import { TimestampedEntity } from '../../utils/base.entity';
import { MovieCast } from './movie-cast.entity';

export enum SubscriptionType {
  FREE = 'free',
  PREMIUM = 'premium',
}

@Entity('movies')
export class Movie extends TimestampedEntity {
  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Index('IDX_MOVIE_SLUG')
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  release_year: number;

  @Column({ type: 'int' })
  duration_minutes: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  poster_url: string | null;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  rating: number;

  @Column({ type: 'enum', enum: SubscriptionType, default: SubscriptionType.FREE })
  subscription_type: SubscriptionType;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'integer', unique: true, nullable: true })
  tmdbId: number;
  
  @ManyToOne(() => User, (user) => user.movies, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  created_by: User | null;

  @OneToMany(() => MovieFile, (file) => file.movie)
  files: MovieFile[];

  @OneToMany(() => MovieCategory, (mc) => mc.movie)
  movie_categories: MovieCategory[];

  @OneToMany(() => Favourites, (favourite) => favourite.movie)
  favourites: Favourites[];

  @OneToMany(() => Reviews, (reviews) => reviews.movie)
  reviews: Reviews[];

  @OneToMany(() => MovieCast, (mcast) => mcast.movie)
  movieCasts: MovieCast[]
}