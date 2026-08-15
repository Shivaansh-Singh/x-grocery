"use client";

import { useEffect, useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Search groceries (e.g. Maggi, Milk, Chips)...",
  initialQuery = "",
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-3.5 text-zinc-400 pointer-events-none text-sm">
        🔍
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs transition-all"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs transition-colors"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
