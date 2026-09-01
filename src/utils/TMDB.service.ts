import { BadRequestException, Injectable } from "@nestjs/common";

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
}