import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import useLocation from '../hooks/useLocation';
import axios from 'axios';
import styles from '../styles/Recommend.module.css';
import SearchBar from '../components/Search/SearchBar';

export default function Recommend() {
  const { location, error: locationError, loading: locationLoading } = useLocation();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [filteredAttractions, setFilteredAttractions] = useState([]);
  const [visibleAttractions, setVisibleAttractions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const [searchTerm, setSearchTerm] = useState('');

  const lastAttractionElementRef = useRef();

  const [activeFilters, setActiveFilters] = useState({
    type: '전체',
    tag: '전체'
  });

const router = useRouter();

const handleCardClick = (attraction) => {
  if (!attraction.name) return;
  
  // 검색 키워드를 localStorage에 저장
  localStorage.setItem('searchKeyword', attraction.name);
  // 지도 페이지로 강제 이동
  window.location.href = '/map';
};


  // 검색 필터 적용 함수
  const applySearchFilter = useCallback((term) => {
    if (!term) {
      setFilteredAttractions(attractions);
      return;
    }

    const filtered = attractions.filter(item => 
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredAttractions(filtered);
  }, [attractions]);

  // 위치 정보 디버깅
  useEffect(() => {
    if (location) {
      console.log('위치 정보 로드 성공:', location);
    } else if (locationError) {
      console.error('위치 정보 로드 오류:', locationError);
    }
  }, [location, locationError]);

  // 날씨 정보 가져오기
  useEffect(() => {
    if (!location) return;

    // Mock 데이터 - 날씨 API 실패 시 폴백
    const mockWeatherData = {
      temperature: 23,
      humidity: 65,
      windSpeed: 2.5,
      condition: "Clear", // Clear, Clouds, Rain, Snow
      sky: "맑음"
    };

    async function fetchWeather() {
      try {
        setWeatherLoading(true);
        setWeatherError(null);

        console.log('날씨 API 요청 매개변수:', {
          latitude: location.latitude,
          longitude: location.longitude
        });

        const response = await axios.get('/api/weather', {
          params: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        });

        console.log('날씨 API 응답:', response.data);

        if (response.data.success) {
          setWeather(response.data.data);
        } else {
          throw new Error(response.data.message || '날씨 정보를 가져오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('날씨 데이터 오류:', err);
        setWeatherError(err.message || '날씨 정보를 가져오는데 실패했습니다.');

        // API가 실패할 경우 Mock 데이터 사용
        console.log('날씨 API 실패, Mock 데이터 사용');
        setWeather(mockWeatherData);
      } finally {
        setWeatherLoading(false);
      }
    }

    fetchWeather();
  }, [location]);

  // 관광지 정보 가져오기
  useEffect(() => {
    if (!location || !weather?.condition) return;

    async function fetchAttractions() {
      try {
        const response = await axios.get('/api/attractions', {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            weatherCondition: weather.condition,
            limit: 50 // 더 많은 데이터 로드
          }
        });

        if (response.data.attractions) {
          setAttractions(response.data.attractions);
          setFilteredAttractions(response.data.attractions);
          setPage(1);
          setHasMore(true);
        }
      } catch (err) {
        console.error('관광지 데이터 오류:', err);
      }
    }

    fetchAttractions();
  }, [location, weather]);

  // 필터 적용
  useEffect(() => {
    if (!attractions.length) return;
  
    let filtered = [...attractions];
  
    // 실내/야외 필터 적용
    if (activeFilters.type !== '전체') {
      const typeMap = {
        '실내': 'indoor',
        '야외': 'outdoor'
      };
      const filterType = typeMap[activeFilters.type] || '';
      filtered = filtered.filter(item => item.type === filterType);
    }
  
    // 태그 기반 대분류 필터 적용
    if (activeFilters.tag !== '전체') {
      filtered = filtered.filter(item =>
        Array.isArray(item.tags) &&
        item.tags.some(tag => tag === activeFilters.tag)
      );
    }
  
    setFilteredAttractions(filtered);
    setPage(1);
    setHasMore(true);
  }, [attractions, activeFilters]);


  // 무작위 스크롤 구현을 위한 페이지네이션 효과
  useEffect(() => {
    if (filteredAttractions.length === 0) return;

    const itemsPerPage = 10; // 한 번에 표시할 아이템 수 증가
    const startIndex = 0;
    const endIndex = Math.min(page * itemsPerPage, filteredAttractions.length);

    setVisibleAttractions(filteredAttractions.slice(startIndex, endIndex));
    setHasMore(endIndex < filteredAttractions.length);
  }, [filteredAttractions, page]);

  // 무작위 스크롤 구현
  useEffect(() => {
    if (!lastAttractionElementRef.current || !hasMore || loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        // 로딩 표시를 위해 상태 업데이트
        setLoading(true);

        // 약간의 지연 추가 (로딩 효과용)
        setTimeout(() => {
          setPage(prevPage => prevPage + 1);
          setLoading(false);
        }, 800);
      }
    }, {
      threshold: 0.5 // 요소가 50% 보일 때 로드
    });

    observer.current.observe(lastAttractionElementRef.current);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, loading, visibleAttractions]);

  // 0414 searchBar 관련
  useEffect(() => {
    applySearchFilter(searchTerm);
  }, [searchTerm, applySearchFilter]);

  // 필터 변경 핸들러
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // 필터 UI 부분
  const locationTypes = ['전체', '실내', '야외'];
  const categories = [
  '전체',
  '자연/힐링',
  '종교/역사/전통',
  '체험/학습/산업',
  '문화/예술',
  '캠핑/스포츠'
  ];

  // 날씨 상태를 서버 응답과 일치하게 변환하는 유틸리티 함수
  const getWeatherIcon = (condition) => {
    if (!condition) return '🌈';

    switch (condition) {
      case 'Clear':
        return '☀️';
      case 'Clouds':
        return '☁️';
      case 'Rain':
        return '🌧️';
      case 'Snow':
        return '❄️';
      default:
        return '🌈';
    }
  };

  const getWeatherText = (condition) => {
    if (!condition) return '알 수 없음';

    switch (condition) {
      case 'Clear':
        return '맑음';
      case 'Clouds':
        return '흐림';
      case 'Rain':
        return '비';
      case 'Snow':
        return '눈';
      default:
        return '알 수 없음';
    }
  };

  const getRecommendation = (condition) => {
    if (!condition) return '다양한 활동';

    switch (condition) {
      case 'Clear':
        return '야외 관광지';
      case 'Clouds':
        return '문화시설';
      case 'Rain':
        return '실내 관광지';
      case 'Snow':
        return '온천/실내 휴양지';
      default:
        return '다양한 활동';
    }
  };

  return (
    <>
      <Head>
        <title>맞춤형 관광지 추천 - 날씨별 관광지 추천 서비스</title>
        <meta name="description" content="나에게 맞는 관광지를 추천받아보세요." />
      </Head>

      <Header />
      <section className="section">
        <div className="container">
          <h1 className={styles.pageTitle}>맞춤형 관광지 추천</h1>
          <div className={styles.heroSection}>
            <p className={styles.heroText}>현재 위치와 날씨를 기반으로<br />맞춤형 여행지를 추천해드려요</p>
            <div className={styles.heroIcons}>
              <span>📍</span>
              <span>+</span>
              <span>🌤️</span>
              <span>=</span>
              <span>✨</span>
            </div>
          </div>

          {/* 위치 정보 로딩/오류 상태 표시 */}
          {locationLoading && (
            <div className={styles.statusMessage}>
              <p>📍 위치 정보를 가져오는 중입니다...</p>
            </div>
          )}

          {locationError && (
            <div className={styles.errorMessage}>
              <p>❌ 위치 정보를 가져오는데 문제가 발생했습니다: {locationError}</p>
              <p>기본 위치(서울)를 기준으로 정보를 제공합니다.</p>
            </div>
          )}

          {/* 날씨 정보 로딩/오류 상태 표시 */}
          {weatherLoading && (
            <div className={styles.statusMessage}>
              <p>🌤️ 날씨 정보를 가져오는 중입니다...</p>
            </div>
          )}

          {weatherError && (
            <div className={styles.errorMessage}>
              <p>❌ 날씨 정보를 가져오는데 문제가 발생했습니다: {weatherError}</p>
              <p>기본 날씨 정보를 기준으로 추천합니다.</p>
            </div>
          )}

          {/* 날씨 카드 */}
          {weather && (
            <div className={styles.weatherCard}>
              <div className={`${styles.weatherIcon} ${styles[`weather${weather.condition}`]}`}>
                {getWeatherIcon(weather.condition)}
              </div>
              <div className={styles.weatherInfo}>
                <h3>오늘의 날씨: {getWeatherText(weather.condition)}</h3>
                <p className={styles.weatherDetails}>
                  현재 온도: {weather.temperature}°C | 습도: {weather.humidity}% | 풍속: {weather.windSpeed}m/s
                </p>
                <div className={styles.recommendationBadge}>
                  추천: {getRecommendation(weather.condition)}
                </div>
                {weather.isBackupData && (
                  <p className={styles.warningText}>* 백업 날씨 데이터를 사용 중입니다</p>
                )}
              </div>
            </div>
          )}

          {/* 필터 섹션 */}
          <div className={styles.filtersSection}>
            <h2>관광지 필터</h2>

            <div className={styles.filterGroup}>
              <h3>대분류</h3>
              <div className={styles.filterOptions}>
                {locationTypes.map(option => (
                  <div
                    key={option}
                    className={`${styles.filterOption} ${activeFilters.type === option ? styles.active : ''}`}
                    onClick={() => handleFilterChange('type', option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h3>카테고리</h3>
              <div className={styles.filterOptions}>
                {categories.map(option => (
                  <div
                    key={option}
                    className={`${styles.filterOption} ${activeFilters.tag === option ? styles.active : ''}`}
                    onClick={() => handleFilterChange('tag', option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 추천 관광지 목록 (인스타그램 스타일) */}
          <h2 className={styles.attractionsTitle}>추천 관광지</h2>

          {/* 0414 searchBar 관련 + 추천 관광지 목록에서서 한번 더 검색 */}
          <SearchBar onSearch={(term) => {
            setSearchTerm(term); // 상태 저장
            applySearchFilter(term); // 필터링 실행
          }} />

          {filteredAttractions.length === 0 ? (
            <div className={styles.noResults}>
              <p>선택한 조건에 맞는 관광지가 없습니다.</p>
              <p>다른 조건으로 검색해보세요.</p>
            </div>
          ) : (
            <div className={styles.instagramFeed}>
              {visibleAttractions.map((attraction, index) => {
                // 마지막 요소에 ref 연결
                const isLastElement = index === visibleAttractions.length - 1;

                return (
                  <div
                    key={attraction._id || index}
                    className={styles.instagramPost}
                    ref={isLastElement ? lastAttractionElementRef : null}
                    onClick={() => handleCardClick(attraction)}
                  >
                    <div className={styles.postHeader}>
                      <div className={styles.postUser}>
                        <div className={styles.userName}>{attraction.name}</div>
                      </div>
                    </div>

                    <div className={styles.postImage}>
                    <Image 
                      src={attraction.images?.[0] || '/images/logo.png'} 
                      alt={attraction.name}
                      width={600}
                      height={600}
                      layout="responsive"
                      objectFit="cover"
                    />
                    </div>

                    <div className={styles.postContent}>
                      <div className={styles.postCaption}>
                        <strong>{attraction.name}</strong>
                        <span className={styles.captionText}>{attraction.description || attraction.address || '멋진 관광지를 방문해보세요!'}</span>
                      </div>

                      <div className={styles.postMeta}>
                        <div className={styles.distance}>
                          <span>📍 거리: {attraction.distanceKm?.toFixed(1) || '0'}km</span>
                        </div>
                        <div className={styles.type}>
                          <span>🏢 {attraction.type === 'indoor' ? '실내' : attraction.type === 'outdoor' ? '야외' : '실내/야외'}</span>
                        </div>
                      </div>

                      <div className={styles.postTags}>
                        {attraction.tags && attraction.tags.map(tag => (
                          <span key={tag} className={styles.tag}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className={styles.loadingMore}>
                  더 많은 관광지 불러오는 중...
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
} 