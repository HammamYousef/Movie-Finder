import { useState, useEffect } from 'react'
import { useDebounce } from 'react-use';
import Search from '../components/Search'
import Loader from '../components/Loader';
import type { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { getTrendingMovies, updateSearchTerm } from '../lib/appwrite';
import { API_OPTIONS, API_BASE_URL } from '../types';
import { useSearchParams } from 'react-router-dom';

const HomePage = () => {

  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = Number(searchParams.get('page')) || 1;

  const [page, setPage] = useState<number>(initialPage);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  useDebounce(() => 
    setDebouncedSearchTerm(searchTerm),
  500, [searchTerm]
  )

  const fetchMovies = async (query: string = '', pageNum: number = 1) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query ?
          `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&sort_by=popularity.desc`
          :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${pageNum}`;
      const response = await fetch(endpoint, API_OPTIONS);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response === false) {
        setErrorMessage( data.Error || 'Failed to fetch movies');
        setMoviesList([]);
        return;
      }
      setMoviesList(data.results || []);

      if (query && data.results.length > 0) {
        // Update the search term in the database
        await updateSearchTerm(query, data.results[0]);
      }
    } catch (error) {
      setErrorMessage(`Failed to fetch movies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies ?? []);
    } catch (error) {
      console.error('Error loading trending movies:', error);
    }
  }

  const handlePageChange = (direction: 'next' | 'prev') => {
    setPage((prevPage) => {
      if (direction === 'next') {
        return prevPage + 1;
      } else if (direction === 'prev' && prevPage > 1) {
        return prevPage - 1;
      }
      return prevPage;
    });
  }

  useEffect(() => {
    fetchMovies( debouncedSearchTerm, page);
  }, [debouncedSearchTerm, page ]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  useEffect(() => {
    if (page !== Number(searchParams.get('page'))) {
      setSearchParams({ page: String(page) });
    }
  }, [page]);

  useEffect(() => {
    const urlPage = Number(searchParams.get('page')) || 1;
    if (urlPage !== page) setPage(urlPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  

  return (
    <main>
      <div className='pattern'/>
      
      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="hero banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without The Hassle</h1>
          <Search searchTerm = {searchTerm} setSearchTerm = {setSearchTerm}/>
        </header>

        { trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_path ?? ''} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>All movies</h2>
          {isLoading ? (
            <Loader />
          ): errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {moviesList.map((movie) => (
                <MovieCard key={movie.id} movie = {movie}/>
              ))}
            </ul>
          )}
        </section>

        <section className='pagination'>
          <button disabled={page <= 1} onClick={() => handlePageChange('prev')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <span className='text-white'>Page { page }</span>
          <button disabled = {moviesList.length < 20} onClick={() => handlePageChange('next')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </section>
      </div>
    </main>
  )
}

export default HomePage