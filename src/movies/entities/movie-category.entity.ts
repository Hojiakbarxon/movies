import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Movie } from './movie.entity';
import { Category } from '../../categories/entities/category.entity';
import { BaseEntity } from '../../utils/base.entity';

@Entity('movie_categories')
export class MovieCategory extends BaseEntity{
  @ManyToOne(() => Movie, (movie) => movie.movie_categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Category, (category) => category.movie_categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}