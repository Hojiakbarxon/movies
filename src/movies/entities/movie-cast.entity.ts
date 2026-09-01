import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { TimestampedEntity } from "../../utils/base.entity";
import { Movie } from "./movie.entity";
import { Actor } from "../../users/entities/actors.entity";

@Entity('MovieCasts')
@Unique(['movie', 'actor'])
export class MovieCast extends TimestampedEntity {
    @ManyToOne(() => Movie, movie => movie.movieCasts, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'movieId' })
    movie: Movie;

    @ManyToOne(() => Actor, actor => actor.movieCasts, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'actorId' })
    actor: Actor;

    @Column({ type: 'varchar' })
    characterName: string;

    @Column({ type: 'integer'})
    castOrder: number;
}
