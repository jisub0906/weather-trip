import React, { useState, useEffect } from 'react';
import styles from '../../styles/SearchBar.module.css';

function SearchBar({ onSearch, initialValue = '' }) {
    const [searchTerm, setSearchTerm] = useState(initialValue);

   // 처음 로딩 시 initialValue 설정 (처음 1회만)
  useEffect(() => {
    setSearchTerm(initialValue);
  }, []); // ✅ 의존성 배열 비움

  const handleSearch = () => {
    console.log('검색어:', searchTerm);
    if (typeof onSearch === 'function') {
      onSearch(searchTerm);
    } else {
      console.warn('⚠️ 검색 함수(onSearch)가 전달되지 않았어요!');
    }
  };

  return (
    <div className={styles.searchContainer}>
      <input
        className={styles.searchInput}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
      />
      <button
        className={styles.searchButton}
        onClick={handleSearch}
      >
        검색
      </button>
    </div>
  );
}

export default SearchBar;
