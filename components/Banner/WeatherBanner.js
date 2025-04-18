import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/WeatherBanner.module.css';
import useLocation from '@/hooks/useLocation';
import axios from 'axios';

export default function WeatherBanner() {
  const [weather, setWeather] = useState(null);
  const router = useRouter();
  const { location, loading, error } = useLocation();

  useEffect(() => {
    if (!location || loading) return;
    let cancelled = false;

    const fetchWeather = async () => {
      try {
        const response = await axios.get('/api/weather', {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });

        if (!cancelled && response.data?.success) {
          setWeather(response.data.data);
        }
      } catch (error) {
        console.error('🌩️ 날씨 API 호출 실패:', error);
      }
    };

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, [location, loading]);

  const getBannerMessage = (temp, condition) => {
    if (condition.includes('Rain') || condition.includes('Snow')) {
      return {
        emoji: '🌧️',
        jsx: (
          <>
            오늘 같은 날엔 <span className={styles.indoor}>실내에서 즐길 수 있는 여행지</span>가 딱이에요!
          </>
        ),
      };
    } else if (temp <= 11) {
      return {
        emoji: '🥶',
        jsx: (
          <>
            쌀쌀한 날씨엔 <span className={styles.indoor}>실내에서 여유롭게 즐기는 여행지</span>를 추천드려요.
          </>
        ),
      };
    } else if (condition.includes('Clouds')) {
      return {
        emoji: '🌥️',
        jsx: (
          <>
            흐린 날엔 가벼운 바람을 맞으며 <span className={styles.outdoor}>야외 여행지</span>를 둘러보는 것도 좋겠어요!
          </>
        ),
      };
    } else if (temp >= 27) {
      return {
        emoji: '🔥',
        jsx: (
          <>
            무더운 날씨엔 시원한 <span className={styles.indoor}>실내 명소</span>에서 힐링 여행 어떠세요?
          </>
        ),
      };
    } else {
      return {
        emoji: '🌤️',
        jsx: (
          <>
            오늘 같이 적당한 날엔 <span className={styles.outdoor}>야외 여행지</span>로 떠나보세요! 기분 전환에 딱이에요!
          </>
        ),
      };
    }
  };

  if (!weather) return null;

  const { temperature, condition } = weather;
  const { emoji, jsx } = getBannerMessage(temperature, condition);

  return (
    <div className={styles.weatherBanner} onClick={() => router.push('/recommend')}>
      <div className={styles.weatherIcon}>{emoji}</div>
      <div className={styles.textContent}>
        <h3>{jsx}</h3>
        <p className={styles.cta}>
          👉 가장 가까운 여행지가 궁금하다면, 지금 확인해보세요!
        </p>
      </div>
    </div>
  );
}
