import React, { useState } from 'react';
import { Search, X } from 'lucide-react'; // Optional: for clean icons

const SearchBar = ({ onSearch, placeholder = "Search for anything..." }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value); // Triggers search on every keystroke
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query); // Triggers search on enter/submit
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="relative flex items-center w-full h-12 rounded-lg focus-within:shadow-md bg-white overflow-hidden border border-gray-200 transition-all duration-200 focus-within:border-blue-500">
        
        {/* Search Icon */}
        <div className="grid place-items-center h-full w-12 text-gray-300">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        {/* Input Field */}
        <input
          className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
          type="text"
          id="search"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
        />

        {/* Clear Button (Only shows when there is text) */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="h-full px-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;