import React, { useState, useRef, useEffect } from 'react';
import SearchSuggestions from '../SearchSuggestions/SearchSuggestions';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Tìm kiếm dự án..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
    
    // Tìm kiếm real-time khi người dùng nhập
    onSearch(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    onSearch('');
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  const performSearch = (term) => {
    if (term.trim()) {
      // Lưu vào lịch sử tìm kiếm
      saveToRecentSearches(term);
    }
    onSearch(term);
  };

  const saveToRecentSearches = (searchTerm) => {
    try {
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const filteredSearches = recentSearches.filter(search => search !== searchTerm);
      const newRecentSearches = [searchTerm, ...filteredSearches].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  // Đóng suggestions khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar-container" ref={searchRef}>
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(searchTerm.length > 0)}
            placeholder={placeholder}
            className="search-input"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" className="search-button">
          <svg className="search-icon" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </button>
      </form>
      
      <SearchSuggestions
        searchTerm={searchTerm}
        onSuggestionClick={handleSuggestionClick}
        visible={showSuggestions}
      />
    </div>
  );
};

export default SearchBar; 