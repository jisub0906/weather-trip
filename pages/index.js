import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import TopBanner from '../components/Banner/TopBanner';
import KoreaMap from '../components/Map/KoreaMap';
import RollingBanner from '../components/Banner/RollingBanner';
import WeatherBanner from '../components/Banner/WeatherBanner';
import useLocation from '../hooks/useLocation';
import axios from 'axios';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { calculateAttractionsDistance } from '../utils/distance';


// 컴포넌트 외부로 이동
const REGION_COORDINATES = {
  'seoul': { latitude: 37.5665, longitude: 126.9780 },
  'busan': { latitude: 35.1796, longitude: 129.0756 },
  'daegu': { latitude: 35.8714, longitude: 128.6014 },
  'incheon': { latitude: 37.4563, longitude: 126.7052 },
  'gwangju': { latitude: 35.1595, longitude: 126.8526 },
  'daejeon': { latitude: 36.3504, longitude: 127.3845 },
  'ulsan': { latitude: 35.5384, longitude: 129.3114 },
  'sejong': { latitude: 36.4800, longitude: 127.2890 },
  'gyeonggi': { latitude: 37.4138, longitude: 127.5183 },
  'gangwon': { latitude: 37.8228, longitude: 128.1555 },
  'chungbuk': { latitude: 36.8000, longitude: 127.7000 },
  'chungnam': { latitude: 36.5184, longitude: 126.8000 },
  'jeonbuk': { latitude: 35.8200, longitude: 127.1500 },
  'jeonnam': { latitude: 34.8160, longitude: 126.4630 },
  'gyeongbuk': { latitude: 36.4919, longitude: 128.8889 },
  'gyeongnam': { latitude: 35.4606, longitude: 128.2132 },
  'jeju': { latitude: 33.4996, longitude: 126.5312 },
  'all': { latitude: 36.5, longitude: 127.8 }
};


// 관광지 목록 섹션 컴포넌트
const AttractionListSection = ({ 
  loading, 
  error, 
  attractions,
  isOpen,
  onOpenChange,
  userLocation,
  onCardClic 
}) => {
  const attractionsWithDistance = calculateAttractionsDistance(attractions, userLocation);

  return (
    <div className={`${styles.attractionListSection} ${isOpen ? styles.open : ''}`}>
      <div className={styles.listHeader}>
        <h2>관광지 목록</h2>
        <button 
          className={styles.closeButton}
          onClick={() => onOpenChange(false)}
          aria-label="관광지 목록 닫기"
        >
          ×
        </button>
      </div>

      {loading && (
        <div className={styles.loading}>
          <p>관광지 정보를 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && attractionsWithDistance.length > 0 && (
        <div className={styles.attractionsList}>
          {attractionsWithDistance.map((attraction, index) => (
            <div 
            key={attraction._id || index} 
            className={styles.locationCard}
            onClick={() => onCardClic(attraction)}
            >
              <div className={styles.locationInfo}>
                <h4 className={styles.locationName}>{attraction.name}</h4>
                <p className={styles.locationAddress}>
                  <span className={styles.icon}>📍</span>
                  {attraction.address}
                </p>
                {attraction.distance && (
                  <span className={styles.distance}>
                    <span className={styles.icon}>🚗</span>
                    {attraction.distance.toFixed(1)}km
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const { location: userLocation } = useLocation();
  const [activeRegion, setActiveRegion] = useState('seoul');
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popularAttractions, setPopularAttractions] = useState([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const router = useRouter();

  const handleCardClick = (attraction) => {
    if (!attraction?.name) return;
    localStorage.setItem('searchKeyword', attraction.name);
    window.location.href = '/map'; // 혹은 router.push('/map')로 SPA 방식 처리
  };

  const fetchAttractions = useCallback(async (region) => {
    setLoading(true);
    setError(null);
    try {
      const coords = REGION_COORDINATES[region] || REGION_COORDINATES.all;
      const response = await axios.get('/api/attractions', {
        params: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          radius: region === 'all' ? 300 : 100,
          limit: 100
        }
      });

      if (response.data && response.data.attractions) {
        setAttractions(response.data.attractions);
      } else {
        setAttractions([]);
      }
    } catch (err) {
      console.error('관광지 데이터 로딩 오류:', err);
      setError('관광지 정보를 불러오는데 실패했습니다.');
      setAttractions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegionSelect = useCallback((region) => {
    setActiveRegion(region);
    setIsListOpen(true);
    fetchAttractions(region);
  }, [fetchAttractions]);

  useEffect(() => {
    fetchAttractions('seoul');
  }, [fetchAttractions]);

  useEffect(() => {
    const fetchPopularAttractions = async () => {
      setPopularLoading(true);
      try {
        const response = await axios.get('/api/attractions/popular');
        if (response.data.success && response.data.data.attractions) {
          setPopularAttractions(response.data.data.attractions);
        } else {
          setPopularAttractions([]);
        }
      } catch (error) {
        console.error('인기 관광지 데이터 로딩 실패:', error);
        setPopularAttractions([]);
      } finally {
        setPopularLoading(false);
      }
    };

    fetchPopularAttractions();
  }, []);

  return (
    <>
      <Head>
        <title>weather trip</title>
        <meta name="description" content="대한민국의 다양한 관광지를 찾아보세요." />
      </Head>

      <TopBanner />
      <Header />
      <main className={styles.main}>
        <RollingBanner />
        <WeatherBanner />
        <KoreaMap selectedRegion={activeRegion} onRegionSelect={handleRegionSelect} />
        <AttractionListSection
          loading={loading}
          error={error}
          attractions={attractions}
          isOpen={isListOpen}
          onOpenChange={setIsListOpen}
          userLocation={userLocation}
          onCardClic={handleCardClick}
        />
      </main>

      <section className={styles.popularSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>인기 여행지</h2>
          {popularLoading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : popularAttractions.length === 0 ? (
            <div className={styles.noAttractions}>
              아직 인기 여행지가 없습니다. 여행지에 좋아요를 눌러주세요!
            </div>
          ) : (
            <div className={styles.popularGrid}>
              {popularAttractions.map((attraction, index) => (
                <div key={attraction._id} 
                className={styles.popularCard} 
                onClick={() => handleCardClick(attraction)}
                >
                  <div className={styles.rankBadge}>#{index + 1}</div>
                  <div className={styles.imageContainer}>
                    {Array.isArray(attraction.images) && attraction.images.length > 0 ? (
                      <Image
                        src={attraction.images[0]}
                        alt={attraction.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        priority={index < 2}
                      />
                    ) : (
                      <div className={styles.noImage}>이미지 없음</div>
                    )}
                  </div>
                  <h3>{attraction.name}</h3>
                  <div className={styles.likeCount}>
                    ❤️ {attraction.likeCount || 0}
                  </div>
                  <div className={styles.address}>{attraction.address}</div>
                  <div className={styles.description}>
                    {attraction.description?.slice(0, 100)}
                    {attraction.description?.length > 100 ? '...' : ''}
                  </div>
                  <div className={styles.tags}>
                    {attraction.tags?.map((tag, i) => (
                      <span key={i} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}