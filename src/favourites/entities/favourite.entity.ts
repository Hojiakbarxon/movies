import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Movie } from "../../movies/entities/movie.entity";
import { TimestampedEntity } from "../../utils/base.entity";

@Entity("Favourites")
export class Favourites extends TimestampedEntity{
    @ManyToOne(() => User, (user) => user.favourites, {
        onDelete: "CASCADE"
    })
    user: User;

    @ManyToOne(() => Movie, (movie) => movie.favourites, {
        onDelete: "CASCADE"
    })
    movie: Movie;
}