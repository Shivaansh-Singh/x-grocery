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
      <div className="absolute left-3.5 text-[#8A90A3] pointer-events-none">
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-3 bg-[#141822]/90 border border-white/8 rounded-2xl text-xs font-semibold text-[#F5F6FA] placeholder-[#8A90A3] focus:outline-none focus:border-[#2D6CFF] focus:ring-2 focus:ring-[#2D6CFF]/40 transition-all shadow-md focus:shadow-[0_0_16px_rgba(45,108,255,0.20)]"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-full text-[#8A90A3] hover:text-[#F5F6FA] text-xs transition-colors"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
