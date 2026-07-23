import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search for anything..." 
}) => {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value); 
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSearch) onSearch(query); 
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="relative flex items-center w-full h-12 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-xl overflow-hidden focus-within:border-slate-700 transition-all duration-300">
        
        {/* Search Icon */}
        <div className="grid place-items-center h-full w-12 text-slate-400 shrink-0">
          <Search className="h-4 w-4" />
        </div>

        {/* Input Field */}
        <input
          className="peer h-full w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500 pr-2"
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
            className="h-full px-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;