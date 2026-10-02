import { BadRequestException, Injectable } from "@nestjs/common";

type TmdbActor = {
    id: number;
    name: string;
    birthday: string;
    deathday: string;
    biography: string;
    placeOfBirth: string;
    profilePath: string;
    gender: number;
    adult: boolean
}
@Injectable()
export class TmdbService {
    private readonly baseUrl = 'https://api.themoviedb.org/3';
    async searchMovies(query: string) {
        const response = await fetch(
            `${this.baseUrl}/search/movie?query=${encodeURIComponent(query)}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                    accept: 'application/json',
                },
            },
        );

        if (!response.ok) {
            throw new BadRequestException(
                'Failed to search movies on TMDB',
            );
        }

        return response.json();
    }

    async getMovieCast(tmdbMovieId: number) {
        const response = await fetch(
            `${this.baseUrl}/movie/${tmdbMovieId}/credits`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                    accept: 'application/json',
                },
            },
        );

        if (!response.ok) {
            throw new BadRequestException(
                'Failed to fetch movie cast from TMDB',
            );
        }

        const data = await response.json();

        return data.cast;
    }

    async getPerson(tmdbPersonId: number): Promise<TmdbActor> {
        const response = await fetch(
            `${this.baseUrl}/person/${tmdbPersonId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                    accept: 'application/json',
                },
            },
        );

        if (!response.ok) {
            throw new BadRequestException(
                'Failed to fetch person information from TMDB',
            );
        }
        const data = await response.json();

        return {
            id: data.id,
            name: data.name,
            birthday: data.birthday,
            deathday: data.deathday,
            biography: data.biography,
            placeOfBirth: data.place_of_birth,
            profilePath: data.profile_path,
            gender: data.gender,
            adult: data.adult,
        };  
    }
}