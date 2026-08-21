import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';
import { MovieCategory } from '../../movies/entities/movie-category.entity';
import { BaseEntity } from '../../utils/base.entity';

@Entity('categories')
export class Category extends BaseEntity{
    @Column({ type: 'varchar', length: 50 })
    name: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @OneToMany(() => MovieCategory, (movie_category) => movie_category.category)
    movie_categories: MovieCategory[]
}   