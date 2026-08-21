import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Movie } from "./movie.entity";
import { TimestampedEntity } from "../../utils/base.entity";

@Entity("Reviews")
export class Reviews extends TimestampedEntity{
    @ManyToOne(() => User, (user) => user.reviews, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Movie, (movie) => movie.reviews, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "movie_id" })
    movie: Movie;

    @Column({ type: "integer" })
    rating: number;

    @Column({ type: "text" })
    comment: string;
}