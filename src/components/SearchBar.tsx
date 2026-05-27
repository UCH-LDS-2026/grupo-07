import React, { useState } from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex items-center">
      <span className={`material-symbols-outlined absolute left-4 transition-all duration-300 z-10 ${
        isFocused ? 'text-primary-container scale-110' : 'text-black/40'
      }`}>
        search
      </span>

      <input
        type="text"
        placeholder="BUSCAR ENTIDAD..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          font-space text-[11px] font-bold tracking-widest text-black
          pl-12 pr-6 py-3 rounded-full transition-all duration-500 ease-out
          border outline-none
          ${isFocused 
            ? 'w-[350px] bg-white border-primary-container shadow-[0_0_20px_rgba(0,183,255,0.2)]' 
            : 'w-[240px] bg-white border-white/10 hover:border-white/40'
          }
          placeholder:text-black/30 placeholder:font-bold
        `}
      />
    </div>
  );
};

export default SearchBar;