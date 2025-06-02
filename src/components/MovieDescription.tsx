import React from 'react'
import type { MovieDetails } from '../types';

interface MovieDescriptionProps {
  description: MovieDetails;
}

const MovieDescription = ({description : {genres, overview, release_date, production_countries, status, spoken_languages, budget, revenue, tagline, production_companies}} : MovieDescriptionProps) => {
  
  const formatDate = (date: string): string => {
  if (!date) return "Unknown";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

  const formatBudget = (amount: number): string => {
    if (amount < 1_000_000) return `$${amount.toLocaleString()}`;
    return `$${(amount / 1_000_000).toFixed(1)} Million`;
  };
  
  return (
    <div className="description-grid">
          <p className="description-title">Genres</p>
          <div className="flex-gap">
            {genres.map((genre) => (
              <span key={genre.id} className="badge">{genre.name}</span>
            ))}
          </div>

          <p className="description-title">Overview</p>
          <p className="description-text text-white font-normal">
            {overview || "No overview available."}
          </p>

          <p className="description-title">Release date</p>
          <p className="description-text">{formatDate(release_date)} (Worldwide)</p>

          <p className="description-title">Countries</p>
          <div className="flex-gap description-text">
            {production_countries.map((country, index) => (
              <React.Fragment key={country.iso_3166_1}>
              <span>{country.name}</span>
              {index < production_countries.length - 1 && <span>•</span>}
              </React.Fragment>
            ))}
          </div>

          <p className="description-title">Status</p>
          <p className="description-text">{status}</p>

          <p className="description-title">Language</p>
          <div className="flex-gap description-text">
            {spoken_languages.map((language, index) => (
              <React.Fragment key={language.iso_639_1}>
                <span>{language.english_name}</span>
                {index < spoken_languages.length - 1 && <span>•</span>}
              </React.Fragment>
            ))}
          </div>

          <p className="description-title">Budget</p>
          <p className="description-text">{formatBudget(budget)}</p>

          <p className="description-title">Revenue</p>
          <p className="description-text">{formatBudget(revenue)}</p>

          <p className="description-title">Tagline</p>
          <p className="description-text">{tagline}</p>

          <p className="description-title">Production Companies</p>
          <div className="flex-gap description-text">
            {production_companies.map((company, index) => (
              <React.Fragment key={company.id}>
                <span>{company.name}</span>
                {index < production_companies.length - 1 && <span>•</span>}
              </React.Fragment>
            ))}
            <span>Legendary Entertainment</span><span>•</span>
            <span>Warner Bros. Entertainment</span><span>•</span>
            <span>Villeneuve Films</span>
          </div>
    </div>
  )
}

export default MovieDescription