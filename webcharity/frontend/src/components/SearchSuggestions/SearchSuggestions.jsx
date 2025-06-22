import React, { useState, useEffect } from 'react';
import './SearchSuggestions.css';

const SearchSuggestions = ({ searchTerm, onSuggestionClick, visible }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Danh sách gợi ý tìm kiếm
  const popularSearches = [
    'Giáo dục',
    'Trẻ em',
    'Môi trường',
    'Trường học',
    'Thiên nhiên',
    'Học sinh',
    'Xanh sạch',
    'Bảo vệ môi trường',
    'Giáo viên',
    'Trồng cây'
  ];

  // Danh sách danh mục (chỉ 3 danh mục)
  const categories = [
    { name: 'Giáo dục', icon: '📚' },
    { name: 'Trẻ em', icon: '👶' },
    { name: 'Môi trường', icon: '🌱' }
  ];

  useEffect(() => {
    if (!visible || !searchTerm) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const filteredSuggestions = popularSearches.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSuggestions(filteredSuggestions.slice(0, 5));
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, visible]);

  if (!visible) return null;

  return (
    <div className="search-suggestions">
      {loading ? (
        <div className="suggestion-loading">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      ) : (
        <>
          {/* Gợi ý tìm kiếm */}
          {suggestions.length > 0 && (
            <div className="suggestion-section">
              <h4>Gợi ý tìm kiếm</h4>
              <div className="suggestion-list">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-item"
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    <svg className="suggestion-icon" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Danh mục phổ biến */}
          <div className="suggestion-section">
            <h4>Danh mục phổ biến</h4>
            <div className="category-list">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className="category-item"
                  onClick={() => onSuggestionClick(category.name)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tìm kiếm gần đây */}
          <div className="suggestion-section">
            <h4>Tìm kiếm gần đây</h4>
            <div className="recent-searches">
              {localStorage.getItem('recentSearches') ? (
                JSON.parse(localStorage.getItem('recentSearches'))
                  .slice(0, 3)
                  .map((search, index) => (
                    <button
                      key={index}
                      className="recent-search-item"
                      onClick={() => onSuggestionClick(search)}
                    >
                      <svg className="recent-icon" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                      {search}
                    </button>
                  ))
              ) : (
                <p className="no-recent">Chưa có tìm kiếm gần đây</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchSuggestions; 