import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import styles from '../../styles/AttractionDetail.module.css';
import axios from 'axios';

export default function AttractionDetail({ attraction, onClose }) {
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [likeCount, setLikeCount] = useState(attraction.likeCount || 0);
  const [loading, setLoading] = useState(true);

  // 이미지 배열이 없거나 비어있는 경우 기본 이미지 사용
  const images = attraction.images && attraction.images.length > 0
    ? attraction.images
    : ['/next.svg'];

  // 컴포넌트가 마운트될 때 리뷰 데이터 불러오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/attractions/${attraction._id}/reviews`);
        if (response.data.success) {
          setReviews(response.data.reviews);
        }
      } catch (error) {
        console.error('리뷰 데이터 불러오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [attraction._id]);

  const handleLike = async () => {
    try {
      setLiked(!liked);
      // 좋아요 상태 업데이트 (UI 즉시 반영)
      const newLikeCount = liked ? likeCount - 1 : likeCount + 1;
      setLikeCount(newLikeCount);
      
      // API 호출
      const response = await axios.post(`/api/attractions/${attraction._id}/like`, { 
        liked: !liked 
      });
      
      // API 응답에 따라 좋아요 수 정확히 업데이트
      if (response.data.success) {
        setLikeCount(response.data.likeCount);
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error);
      // 오류 발생 시 원래 상태로 복구
      setLiked(liked);
      setLikeCount(likeCount);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim()) return;

    try {
      const response = await axios.post(`/api/attractions/${attraction._id}/review`, {
        comment: review,
      });
      setReviews([response.data, ...reviews]);
      setReview('');
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
    }
  };

  return (
    <div className={styles.detailContainer}>
      <div className={styles.navigationButtons}>
        <button className={styles.backButton} onClick={onClose} aria-label="뒤로 가기">
          <FaArrowLeft size={18} />
          <span className={styles.backButtonText}>관광지 목록</span>
        </button>
        <button className={styles.closeButton} onClick={onClose} aria-label="닫기">
          <IoClose size={24} />
        </button>
      </div>
      
      <div className={styles.imageContainer}>
        <img 
          src={images[0]} 
          alt={attraction.name} 
          className={styles.mainImage}
        />
      </div>
      
      <div className={styles.contentContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>{attraction.name}</h2>
          <div className={styles.likeContainer}>
            <button 
              className={styles.likeButton} 
              onClick={handleLike}
              aria-label={liked ? '좋아요 취소' : '좋아요'}
            >
              {liked ? <FaHeart color="#e74c3c" /> : <FaRegHeart />}
            </button>
            <span className={styles.likeCount}>{likeCount}</span>
          </div>
        </div>
        
        <p className={styles.address}>
          <FaMapMarkerAlt /> {attraction.address}
        </p>
        
        {attraction.description && (
          <p className={styles.description}>{attraction.description}</p>
        )}
        
        <div className={styles.divider}></div>
        
        <h3 className={styles.sectionTitle}>리뷰 작성</h3>
        <form onSubmit={handleSubmit} className={styles.reviewForm}>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="리뷰를 작성하세요..."
            className={styles.reviewInput}
          />
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting || !review.trim()}
          >
            작성
          </button>
        </form>
        
        <div className={styles.divider}></div>
        
        <h3 className={styles.sectionTitle}>리뷰 ({reviews.length})</h3>
        {loading ? (
          <p className={styles.loading}>리뷰를 불러오는 중...</p>
        ) : reviews.length === 0 ? (
          <p className={styles.noReviews}>아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!</p>
        ) : (
          <div className={styles.reviewsList}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <span className={styles.userName}>{review.userName}</span>
                </div>
                <div className={styles.reviewContent}>
                  <p>{review.comment}</p>
                </div>
                <span className={styles.reviewDate}>
                  {new Date(review.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 