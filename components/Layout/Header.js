import Link from 'next/link';
import Image from 'next/image';
import styles from '../../styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      {/* 상단 바: 로고 + 상태내역역 */}
      <div className={styles.topBar}>
        <div className={styles.logo}>
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="logo" 
              width={180} 
              height={60} 
              priority
              quality={100}
              style={{
                objectFit: 'contain',
                maxWidth: '100%',
                height: 'auto',
                padding: '10px 0'
              }}
            />
          </Link>
        </div>
        <div className={styles.auth}>
          <Link href="/login">로그인</Link>
          <span> / </span>
          <Link href="/signup">회원가입</Link>
        </div>
      </div>
      {/* 내비게이션 바바 */}
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
