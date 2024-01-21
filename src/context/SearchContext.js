// SearchContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  
  const getSearches = async (query) => {
    const endpoints = ['musics', 'albums', 'playlists', 'artists'];
    const results = {};
    try {
      for (const endpoint of endpoints) {
        const url = `https://yt-music-api-zeta.vercel.app/search/${endpoint}?query=${query}`;
        const { data } = await axios.get(url);
        results[`${endpoint}Results`] = data;
      }
      console.log("results", results)
      return results;
    } catch (error) {
      console.error('Error fetching data:', error);
      // Return an empty object or handle the error appropriately
      return {};
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['searchResults', searchQuery],
    queryFn: () => getSearches(searchQuery),
    enabled: !!searchQuery, // only run the query if searchQuery is not empty
  });

  const getSearchSuggestions = async (query) => {
    const url = `https://yt-music-api-zeta.vercel.app/search/suggestions?query=${query}`;
    try {
      const { data } = await axios.get(url);
      setSearchSuggestions(data);
      console.log("suggestions", data)
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  useEffect(() => {
    if (searchQuery) {
      getSearchSuggestions(searchQuery);
    }
  }, [searchQuery]);
  return (
    <SearchContext.Provider value={{ data, isLoading, error, searchQuery, searchSuggestions, setSearchQuery,getSearches,getSearchSuggestions }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
