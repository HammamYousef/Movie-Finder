import { Client, Databases, Query, ID} from 'appwrite';
import type { Movie } from '../types';

export const client = new Client();

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

client
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject(PROJECT_ID);

const database = new Databases(client);


export const updateSearchTerm = async (searchTerm: string, movie: Movie) => {
    
    //Use the Appwrite SDK to check if the search term already exists in the database
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm)
        ])

        // If the search term exists, increment the count
        if (result.documents.length > 0) {
            const document = result.documents[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, document.$id, {
                count : document.count + 1,
            });

        // If the search term does not exist, create a new document
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error('Error updating search term:', error);
        
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ]);
        return result.documents.map((doc) => ({
      id: doc.movie_id ?? 0,
      title: doc.searchTerm ?? '',
      overview: '',
      poster_path: doc.poster_url ?? null,
      backdrop_path: null,
      release_date: '',
      genre_ids: [],
      original_language: '',
      original_title: '',
      popularity: 0,
      vote_average: 0,
      vote_count: 0,
      adult: false,
      video: false,
    }));

    } catch (error) {
        console.error('Error fetching trending movies:', error);
    }
}