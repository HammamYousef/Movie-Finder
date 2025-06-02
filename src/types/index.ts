export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  video: boolean;
};

export interface MovieDetails extends Omit<Movie, 'genre_ids'> {
  genres: Genre[];
  budget: number;
  revenue: number;
  runtime: number;
  status: string;
  tagline: string;
  homepage: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  trailer: Trailer | null;
}

export interface Trailer {
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  iso_639_1: string;
  name: string;
  english_name: string;
}

export const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};