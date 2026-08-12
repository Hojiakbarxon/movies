import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';
import { MovieCategory } from '../../movies/entities/movie-category.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    name: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    //   @ManyToMany(() => Movie, (movie) => movie.categories)
    //   movies: Movie[];

    @OneToMany(() => MovieCategory, (movie_category) => movie_category.category)
    movie_categories: MovieCategory[]
}   