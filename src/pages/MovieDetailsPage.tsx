import { useEffect, useState } from "react";
import MovieDescription from "../components/MovieDescription";
import { API_OPTIONS, API_BASE_URL, type MovieDetails, type Trailer } from "../types";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const MovieDetailsPage = () => {
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { movieId } = useParams<{ movieId: string }>();

  const nav = useNavigate();

  const fetchMovieDetails = async (movieId: string) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [detailsResult, videosResult] = await Promise.all([
      fetch(`${API_BASE_URL}/movie/${movieId}?language=en-US`, API_OPTIONS),
      fetch(`${API_BASE_URL}/movie/${movieId}/videos?language=en-US`, API_OPTIONS),
    ]);
      if (!detailsResult.ok || !videosResult.ok) {
        throw new Error("Failed to fetch movie details or videos");
      }

      const details: MovieDetails = await detailsResult.json();
      const videos = await videosResult.json();

      const trailer = videos.results.find(
        (video: Trailer) => video.type === "Trailer" && video.site === "YouTube"
      );

      setMovieDetails({
        ...details,
        trailer: trailer ? { key: trailer.key, name: trailer.name, site: trailer.site, type: trailer.type } : null,
      });

    } catch (error) {
      setErrorMessage(
        `Failed to fetch movie details: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatRuntime = (minutes: number): string => {
    if (minutes < 0) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  const formatVoteCount = (count: number): string => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  }

  useEffect(() => {
    fetchMovieDetails(movieId || "");
  }, [movieId]);

  return (
    <main className="wrapper flex items-center justify-center min-h-screen">
      {isLoading ? (
        <Loader />
      ) : errorMessage ? (
        <p className="text-red-500 movie-details custom-shadow">{errorMessage}</p>
      ) : (
        <div className="movie-details custom-shadow">
          <a onClick={() => nav(-1)} className="back-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            Go Back
          </a>
          <div className="movie-header">
            <div className="movie-header-info">
              <h2>{movieDetails?.title}</h2>
              <div className="movie-header-details">
                <p>{movieDetails?.release_date.split('-')[0]}</p>
                <span>•</span>
                <p>{movieDetails?.adult ? '18+' : 'PG-13'}</p>
                <span>•</span>
                <p>{formatRuntime(movieDetails?.runtime ?? 0)}</p>
              </div>
            </div>
            <div className="movie-header-rating">
              <div>
                <img src="/star.svg" alt="Star Icon" />
                <p>
                  <span className="text-white">{movieDetails?.vote_average.toFixed(1)}</span>/10 ({formatVoteCount(movieDetails?.vote_count ?? 0)})
                </p>
              </div>
              <div>
                <img src="/trending.svg" alt="trending Icon" />
                <p>1</p>
              </div>
            </div>
          </div>
          <div className="movie-poster">
            <img className="rounded-md" src={movieDetails?.poster_path ? `https://image.tmdb.org/t/p/w300/${movieDetails.poster_path}` : '/no-movie.png'} alt={movieDetails?.original_title} />
            {movieDetails?.trailer && (
              <iframe 
                src={`https://www.youtube.com/embed/${movieDetails.trailer.key}`}
                className="rounded-md flex-1 max-sm:min-h-[300px]"
                title={movieDetails.trailer.name}
                allowFullScreen></iframe>
            )}
          </div>
          <div className="movie-description">
            {movieDetails && (
              <MovieDescription description={movieDetails} />
            )}
            <a href={movieDetails?.homepage} target="_blank" rel="noopener noreferrer">
              <span>Visit Homepage</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      )}
    </main>
  );
};

export default MovieDetailsPage;
