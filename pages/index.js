import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/firebase/auth';
import { useRouter } from 'next/router';
import { GoSignOut } from 'react-icons/go';
import Loader from '@/components/Loader';
import { db } from '@/firebase/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    deleteDoc,
  } from 'firebase/firestore';

export default function Home() {
    const { authUser, isLoading, signOut } = useAuth();
    const router = useRouter();
    const [Query, setQuery] = useState('');
    const [gifs, setGifs] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [offset, setOffset] = useState(0);
    const [showFavorites, setShowFavorites] = useState(false);
    const [showAllFavorites, setShowAllFavorites] = useState(false);
  const limit = 3;
  const GIPHY_API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65';
  const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs/search';

  const searchGifs = async (url, offset) => {
    try {
      const response = await axios.get(url, {
        params: {
          api_key: GIPHY_API_KEY,
          q: Query,
          offset,
        },
      });

      const newGifs = response.data.data.map((gif) => ({
        id: gif.id,
        url: gif.images.fixed_height.url,
        title: gif.title,
      }));

      if (offset === 0) {
        setGifs(newGifs);
      } else {
        setGifs((prevGifs) => [...prevGifs, ...newGifs]);
      }
    } catch (error) {
      console.error('Oops, something went wrong!', error);
    }
  };
  

  const toggleFavorite = async (gif) => {
    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', authUser.uid), orderBy('timestamp', 'desc'));
      const response = await getDocs(q);
      const existingFavorites = response.docs.map((doc) => doc.data());

      const isFavorite = existingFavorites.some((favorite) => favorite.gifId === gif.id);

      if (isFavorite) {
        // Remove from favorites
        const favoriteDoc = existingFavorites.find((favorite) => favorite.gifId === gif.id);
        if (favoriteDoc) {
          const favoriteDocRef = doc(favoritesRef, favoriteDoc.id);
          await deleteDoc(favoriteDocRef);

          // Update local state
          fetchFavorites();
        } else {
          console.error('Favorite document not found.');
        }
      } else {
        // Add to favorites
        const docRef = await addDoc(favoritesRef, {
          userId: authUser.uid,
          gifId: gif.id,
          url: gif.url,
          title: gif.title,
          timestamp: new Date(),
        });

        // Update local state
        fetchFavorites();
      }
    } catch (error) {
      console.error('Error toggling favorites:', error);
    }
  };


 const fetchFavorites = async () => {
    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', authUser.uid), orderBy('timestamp', 'desc'));
      const response = await getDocs(q);
      const fetchedFavorites = response.docs.map((doc) => doc.data());
      console.log(fetchedFavorites);

      // Update local state
      setFavorites(fetchedFavorites.map((favorite) => favorite.gifId));
      console.log(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchFavorites();
    }
  }, [authUser]);
  const toggleShowFavorites = () => {
    setShowFavorites((prevShowFavorites) => !prevShowFavorites);
  };

  const toggleShowAllFavorites = () => {
    setShowAllFavorites((prevShowAllFavorites) => !prevShowAllFavorites);
  };

  const handleSearch = () => {
    setOffset(0);
    searchGifs(GIPHY_API_URL, 0);
  };

  const handleNext = () => {
    setOffset((prevOffset) => prevOffset + limit);
  };

  const handlePrevious = () => {
    if (offset >= limit) {
      setOffset((prevOffset) => prevOffset - limit);
    }
  };

  useEffect(() => {
    if (Query !== '' && !showFavorites && !showAllFavorites) {
      searchGifs(GIPHY_API_URL, offset);
    }
  }, [Query, offset, showFavorites, showAllFavorites]);

  useEffect(() => {
    if (authUser) {
      fetchFavorites();
    }
  }, [authUser]);

  useEffect(() => {
    if (showFavorites || showAllFavorites) {
      setQuery('');
    }
  }, [showFavorites, showAllFavorites]);

  return !authUser ? (
    <Loader />
  ) : (
    <main className="">
      <div onClick={signOut} className="bg-black text-white w-44 py-4 mt-10 rounded-lg transition-transform hover:bg-black/[0.8] active:scale-90 flex items-center justify-center gap-2 font-medium shadow-md fixed bottom-5 right-5 cursor-pointer">
        <GoSignOut size={18} />
        <span>Logout</span>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
        {showAllFavorites ? (
          // Display all favorited GIFs
          <div className="max-w-4xl w-full space-y-8 p-8 bg-gray-100 rounded-lg shadow-md">
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowAllFavorites(false)}
                className="bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Back to Search
              </button>
            </div>

            <div className="flex flex-wrap justify-center rounded-lg overflow-hidden">
              {gifs
                .filter((gif) => favorites.includes(gif.id))
                .map((gif) => (
                  <div key={gif.id} className="w-1/3 p-2 rounded-lg">
                    <img src={gif.url} alt={gif.title} />
                    <button
                      onClick={() => toggleFavorite(gif)}
                      className={`mt-2 bg-white text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                        favorites.includes(gif.id) ? 'bg-yellow-300' : ''
                      }`}
                    >
                      {favorites.includes(gif.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          // Display search results or favorites based on the state
          <div className="max-w-4xl w-full space-y-8 p-8 bg-gray-100 rounded-lg shadow-md">
            <div className="flex justify-between">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search for GIFs"
                  value={Query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 bg-gray-100 py-2 px-4 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-0 top-0 bottom-0 px-4 py-2 bg-black text-white rounded-r-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center rounded-lg overflow-hidden">
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                gifs.slice(offset, offset + limit).map((gif) => (
                  <div key={gif.id} className="w-1/3 p-2 rounded-lg">
                    <img src={gif.url} alt={gif.title} />
                    <button
                      onClick={() => toggleFavorite(gif)}
                      className={`mt-2 bg-white text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                        favorites.includes(gif.id) ? 'bg-yellow-300' : ''
                      }`}
                    >
                      {favorites.includes(gif.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={handlePrevious}
                disabled={offset === 0}
                className="bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-lg shadow-sm disabled:opacity-40 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mr-2"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={offset + limit >= gifs.length}
                className="bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-lg shadow-sm disabled:opacity-40 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Next
              </button>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={toggleShowFavorites}
                className="bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mr-2"
              >
                Show Favorites
              </button>
              {/* <button
                onClick={() => setShowAllFavorites(true)}
                className="bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                My Favorites
              </button> */}
            </div>
          </div>
        )}
           {showFavorites && (
          <div className="max-w-4xl w-full space-y-8 p-8 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Your Favorites</h2>
            <div className="flex flex-wrap justify-center rounded-lg overflow-hidden">
              {gifs
                .filter((gif) => favorites.includes(gif.id))
                .map((gif) => (
                  <div key={gif.id} className="w-1/3 p-2 rounded-lg">
                    <img src={gif.url} alt={gif.title} />
                    <button onClick={() => toggleFavorite(gif)}>
                      Remove from Favorites
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}


      </div>
    </main>
  );
                }
