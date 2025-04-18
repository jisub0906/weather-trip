import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import axios from 'axios';
import styles from '@/styles/RollingBanner.module.css';

export default function RollingBanner() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const response = await axios.get('/api/attractions', {
          params: {
            random: true,
            limit: 10
          }
        });

        if (response.data.attractions) {
          const attractionsData = response.data.attractions.map(attraction => ({
            name: attraction.name,
            image: attraction.images[0],
            address: attraction.address,
            description: attraction.description
          }));
          
          setSlides(attractionsData);
        }
      } catch (error) {
        console.error('인기 관광지 데이터 로딩 실패:', error);
        // 에러 시 기본 데이터 사용
        setSlides([
          {
            name: '광화문',
            image: 'https://i.ibb.co/svhf5fW4/0-1.webp',
            address: '서울 종로구 당주동 40'
          },
          {
            name: '조계사',
            image: 'https://i.ibb.co/nsmpsr1y/0-1.jpg',
            address: '서울 종로구 견지동 46'
          },
          {
            name: 'N서울타워',
            image: 'https://i.ibb.co/jZzSKH6L/N-0-0.png',
            address: '서울 용산구 용산동2가 1'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleClick = () => {
    const keyword = slides[current]?.name;
    if (keyword) {
      router.push(`/map?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  const goPrev = () => {
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  };
  
  const goNext = () => {
    setCurrent(prev => (prev + 1) % slides.length);
  };

  if (loading || slides.length === 0) {
    return <div className={styles.banner}>Loading...</div>;
  }

  return (
    <div className={styles.banner}>
      <div className={styles.imageWrapper}>
        <Image 
          src={slides[current].image} 
          alt={slides[current].name} 
          onClick={handleClick}
          width={1920}
          height={1080}
          priority
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%'
          }}
        />
      </div>
      <div className={styles.overlay}>
        <h2>{slides[current].name}</h2>
        <p className={styles.address}>{slides[current].address}</p>
        {slides[current].description && (
          <p className={styles.description}>{slides[current].description}</p>
        )}
      </div>
      <button className={styles.prev} onClick={goPrev}>&#10094;</button>
      <button className={styles.next} onClick={goNext}>&#10095;</button>
    </div>
  );
}
