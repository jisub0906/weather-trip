import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../../styles/Header.module.css';
import MoreMenu from './MoreMenu';

export default function Header() {
  const [userInfo, setUserInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // 로그인 상태 확인
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.user) {
          setUserInfo(data.user);
        } else {
          setUserInfo(null);
        }
      } catch (err) {
        console.error('유저 정보 확인 실패:', err);
        setUserInfo(null);
      }
    };
    fetchUser();
  }, []);

  // 모바일 화면 체크
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // 첫 렌더링 시 체크
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    await fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUserInfo(null);
    window.location.reload();
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="logo"
              width={330}
              height={60}
              priority
              quality={100}
              style={{ objectFit: 'contain', maxWidth: '100%', height: '100%' }}
            />
          </Link>
        </div>

        <div className={styles.auth}>
          {userInfo ? (
            <>
              <span className={styles.nickname}>
                {isMobile ? userInfo.nickname : `${userInfo.nickname} (${userInfo.email})`}
              </span>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                로그아웃
              </button>
              <MoreMenu
                menuItems={[
                  { label: '마이페이지', onClick: () => router.push('/users/mypage') },
                  { label: '고객센터', onClick: () => alert('고객센터는 준비 중입니다.') },
                  { label: '앱 다운로드', onClick: () => alert('앱 다운로드는 준비 중입니다.') },
                ]}
              />
            </>
          ) : (
            <>
              <Link href="/users/login">로그인</Link>
              <Link href="/users/register">회원가입</Link>
            </>
          )}
        </div>
      </div>

      <nav className={styles.navBar}>
        <ul>
          <li><Link href="/">홈</Link></li>
          <li><Link href="/recommend">맞춤 추천</Link></li>
          <li><Link href="/map">지도</Link></li>
        </ul>
      </nav>
    </header>
  );
}
