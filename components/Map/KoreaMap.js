import React, { useState, useEffect } from 'react';
import styles from '../../styles/KoreaMap.module.css';
import koreaGeoData from '../../public/TL_SCCO_CTPRVN.json';

export default function KoreaMap({ onRegionSelect, selectedRegion }) {
  const [pathData, setPathData] = useState({});
  
  // GeoJSON을 SVG 경로로 변환하는 함수
  useEffect(() => {
    // 지도 영역 크기 정의 (SVG viewBox에 맞춤)
    const width = 800;
    const height = 800;
    
    // 지리 좌표를 SVG 좌표로 스케일링하기 위한 함수
    function projectGeoToSvg(coordinates) {
      // 지리 좌표의 범위를 구함 (한국 지도 좌표계의 최소/최대값)
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      
      // 모든 지역의 좌표를 순회하며 최대/최소값 찾기
      koreaGeoData.features.forEach(feature => {
        if (feature.geometry.type === "MultiPolygon") {
          feature.geometry.coordinates.forEach(polygon => {
            polygon.forEach(ring => {
              ring.forEach(([x, y]) => {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
              });
            });
          });
        } else if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates.forEach(ring => {
            ring.forEach(([x, y]) => {
              minX = Math.min(minX, x);
              maxX = Math.max(maxX, x);
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
            });
          });
        }
      });
      
      // 패딩 적용
      const padding = 50;
      const xScale = (width - padding*2) / (maxX - minX);
      const yScale = (height - padding*2) / (maxY - minY);
      
      // 축척을 조정하여 비율 유지
      const scale = Math.min(xScale, yScale);
      
      // 지리 좌표를 SVG 좌표로 변환
      return coordinates.map(([x, y]) => [
        padding + (x - minX) * scale,
        height - padding - (y - minY) * scale // y 축은 반전 (지리좌표와 SVG 좌표계 차이)
      ]);
    }
    
    // GeoJSON 폴리곤을 SVG 경로 문자열로 변환
    function createPathFromGeoJSON(feature) {
      let path = "";
      
      if (feature.geometry.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach(polygon => {
          polygon.forEach(ring => {
            const projectedRing = projectGeoToSvg(ring);
            
            projectedRing.forEach(([x, y], i) => {
              if (i === 0) path += `M${x},${y} `;
              else path += `L${x},${y} `;
            });
            
            path += "Z ";
          });
        });
      } else if (feature.geometry.type === "Polygon") {
        feature.geometry.coordinates.forEach(ring => {
          const projectedRing = projectGeoToSvg(ring);
          
          projectedRing.forEach(([x, y], i) => {
            if (i === 0) path += `M${x},${y} `;
            else path += `L${x},${y} `;
          });
          
          path += "Z ";
        });
      }
      
      return path;
    }
    
    // 각 지역의 경로 데이터 생성
    const paths = {};
    koreaGeoData.features.forEach(feature => {
      // 지역 코드나 이름으로 매핑
      const regionId = feature.properties.CTP_ENG_NM.toLowerCase();
      paths[regionId] = createPathFromGeoJSON(feature);
    });
    
    setPathData(paths);
  }, []);
  
  // 지역 매핑 테이블 (GeoJSON의 영문명을 한글명 및 id로 매핑)
  const regionMapping = {
    'seoul': { nameKo: '서울', code: 'seoul' },
    'busan': { nameKo: '부산', code: 'busan' },
    'daegu': { nameKo: '대구', code: 'daegu' },
    'incheon': { nameKo: '인천', code: 'incheon' },
    'gwangju': { nameKo: '광주', code: 'gwangju' },
    'daejeon': { nameKo: '대전', code: 'daejeon' },
    'ulsan': { nameKo: '울산', code: 'ulsan' },
    'sejong-si': { nameKo: '세종', code: 'sejong' },
    'gyeonggi-do': { nameKo: '경기도', code: 'gyeonggi' },
    'gangwon-do': { nameKo: '강원도', code: 'gangwon' },
    'chungcheongbuk-do': { nameKo: '충청북도', code: 'chungbuk' },
    'chungcheongnam-do': { nameKo: '충청남도', code: 'chungnam' },
    'jeollabuk-do': { nameKo: '전라북도', code: 'jeonbuk' },
    'jeollanam-do': { nameKo: '전라남도', code: 'jeonnam' },
    'gyeongsangbuk-do': { nameKo: '경상북도', code: 'gyeongbuk' },
    'gyeongsangnam-do': { nameKo: '경상남도', code: 'gyeongnam' },
    'jeju-do': { nameKo: '제주도', code: 'jeju' }
  };
  
  // 각 지역 렌더링
  const renderRegions = () => {
    return Object.keys(pathData).map((regionId) => {
      const mapping = regionMapping[regionId] || { nameKo: regionId, code: regionId };
      
      return (
        <path
          key={regionId}
          id={mapping.code}
          d={pathData[regionId]}
          className={`${styles.region} ${selectedRegion === mapping.code ? styles.selected : ''} ${styles[mapping.code]}`}
          onClick={() => onRegionSelect(mapping.code)}
          data-name={mapping.nameKo}
        >
          <title>{mapping.nameKo}</title>
        </path>
      );
    });
  };
  
  // 지역 이름 위치 계산 (중앙점)
  const renderRegionLabels = () => {
    // 구현 생략 - 복잡한 알고리즘이 필요하므로 기존 하드코딩된 레이블 사용
    return Object.entries(regionMapping).map(([id, info]) => {
      // 여기서는 간단히 하드코딩된 위치 정보를 사용
      // 실제 구현에서는 각 경로의 중심점 계산 필요
      const labelPositions = {
        'seoul': {x: 400, y: 280},
        'busan': {x: 540, y: 470},
        // 다른 지역 위치 생략...
      };
      
      const pos = labelPositions[info.code] || {x: 0, y: 0};
      
      return (
        <text 
          key={info.code} 
          x={pos.x} 
          y={pos.y} 
          className={styles.regionLabel}
        >
          {info.nameKo}
        </text>
      );
    });
  };
  
  return (
    <div className={styles.mapSection}>
      <h1 className={styles.mapTitle}>대한민국 관광지 둘러보기</h1>
      <div className={styles.mapWrapper}>
        <svg 
          viewBox="0 0 800 800" 
          xmlns="http://www.w3.org/2000/svg"
          className={styles.mapSvg}
        >
          {/* GeoJSON에서 생성된 지역 경로 */}
          {Object.keys(pathData).length > 0 && renderRegions()}
          
          {/* 독도 명시적으로 추가 */}
          <circle
            cx="790"
            cy="290"
            r="1.6"
            fill="rgba(255, 180, 190, 1)"  /* 경상북도와 동일한 색상 */
            stroke="#000000"
            strokeWidth="0.5"
            className={styles.dokdo}
          />
        </svg>
      </div>
    </div>
  );
}