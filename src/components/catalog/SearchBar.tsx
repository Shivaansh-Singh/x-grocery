"use client";

import { useEffect, useState, useRef } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Search snacks, milk, Maggi...",
  initialQuery = "",
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

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
      <div className="absolute left-3.5 text-[#737D8B] pointer-events-none">
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-3 bg-[#151B24] border border-[#27313D] rounded-2xl text-xs font-semibold text-[#FFFFFF] placeholder-[#737D8B] focus:outline-none focus:border-[#0757D5] focus:ring-1 focus:ring-[#0757D5] transition-all shadow-sm"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-full text-[#737D8B] hover:text-[#FFFFFF] text-xs transition-colors"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
