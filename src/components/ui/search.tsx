import React, { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useAppStore } from '@/store';

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const results = useSearch(query);
  const setActiveSection = useAppStore((state: any) => state.setActiveSection);
  
  const handleResultClick = (sectionId: string) => {
    setActiveSection(sectionId as any);
    setQuery('');
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <div className="flex items-center border border-gray-300 rounded-md bg-white">
        <div className="px-3 py-2">
          <SearchIcon className="h-4 w-4 text-gray-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search across your project..."
          className="w-full py-2 pr-3 outline-none text-sm"
        />
        {query && (
          <button 
            className="px-3 py-2"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
      
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-md mt-1 shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.results.length > 0 ? (
            results.results.map(result => (
              <div 
                key={result.id} 
                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleResultClick(result.sectionId)}
              >
                <p className="font-medium text-sm">{result.title}</p>
                <p className="text-xs text-gray-500">{result.section}</p>
                {result.content && (
                  <p className="text-xs text-gray-700 mt-1 line-clamp-1">{result.content}</p>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500 text-sm">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};