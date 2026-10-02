import { Column, Entity, OneToMany } from 'typeorm';
import { TimestampedEntity } from '../../utils/base.entity';
import { MovieCast } from '../../movies/entities/movie-cast.entity';

@Entity('Actors')
export class Actor extends TimestampedEntity {

    @Column({ type: 'integer', unique: true })
    tmdbId: number;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'date', nullable: true })
    birthday: Date;

    @Column({ type: 'date', nullable: true })
    deathday: Date;

    @Column({ type: 'text', nullable: true })
    biography: string;

    @Column({ type: 'varchar', nullable: true })
    placeOfBirth: string;

    @Column({ type: 'varchar', nullable: true })
    profilePath: string;

    @Column({ type: 'integer', nullable: true })
    gender: number;

    @Column({ type: 'boolean', default: false })
    adult: boolean;

    @OneToMany(() => MovieCast, (mcast) => mcast.actor)
    movieCasts: MovieCast[]
}