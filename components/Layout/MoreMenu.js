import { useState, useRef, useEffect } from 'react';
import styles from '../../styles/Header.module.css';

export default function MoreMenu({ userInfo, menuItems = [] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.moreMenuWrapper} ref={menuRef}>
      <button className={styles.moreButton} onClick={() => setOpen(!open)}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      {open && (
        <div className={styles.dropdown}>
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={styles.dropdownItem}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
