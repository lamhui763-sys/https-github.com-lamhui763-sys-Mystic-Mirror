import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');

  return (
    <div className="relative flex items-center bg-white border border-stone-200 rounded-full px-4 py-2 shadow-sm w-64">
      <Search size={16} className="text-stone-400 mr-2" />
      <input
        type="text"
        placeholder="搜尋內容..."
        className="bg-transparent border-none outline-none text-sm text-stone-700 w-full"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
      />
    </div>
  );
};
