// components/Search/SearchAutoTrigger.js
import { useEffect } from 'react';

export default function SearchAutoTrigger({ mapRef, onSearch, keyword }) {
  useEffect(() => {
    if (!keyword || !mapRef?.current || typeof onSearch !== 'function') return;

    const waitForMapAndSearch = async () => {
      const checkReady = () =>
        mapRef.current &&
        mapRef.current.mapInstance &&
        mapRef.current.mapReady;

      let retries = 20;
      const interval = setInterval(() => {
        if (checkReady()) {
          clearInterval(interval);
          onSearch(keyword);
        } else {
          retries--;
          if (retries <= 0) {
            clearInterval(interval);
            console.warn('🕓 지도 로딩 시간 초과로 자동 검색 실패');
          }
        }
      }, 100);
    };

    waitForMapAndSearch();
  }, [keyword, mapRef, onSearch]);

  return null;
}  