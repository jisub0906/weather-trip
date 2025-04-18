import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import styles from '../../styles/KakaoMap.module.css';
import AttractionDetail from '../Attractions/AttractionDetail';

const KakaoMap = forwardRef(function KakaoMap({ center, onMarkerClick, onNearbyAttractionsLoad, onAllAttractionsLoad, onCloseDetail, isNearbyMode }, ref) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [allAttractionsCached, setAllAttractionsCached] = useState([]); // 전체 관광지 데이터 캐시
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef(null);
  const markersRef = useRef([]);
  const isMapInitializedRef = useRef(false);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 이전 마커 제거 함수
  const clearMarkers = useCallback(() => {
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    }
  }, []);

  // 모든 관광지 정보 가져오기
  const fetchAllAttractions = useCallback(async (map) => {
    if (!map) return;

    setIsLoading(true);

    try {
      // 캐시된 데이터가 있으면 재사용
      if (allAttractionsCached.length > 0) {
        // 부모 컴포넌트에 관광지 목록 전달
        if (onAllAttractionsLoad) {
          onAllAttractionsLoad(allAttractionsCached);
        }

        // 마커 생성
        allAttractionsCached.forEach(attraction => {
          const coords = attraction.location.coordinates;
          const position = new window.kakao.maps.LatLng(coords[1], coords[0]);

          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            position: position,
            map: map,
            title: attraction.name
          });

          // 마커 참조 저장
          markersRef.current.push(marker);

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(marker, 'click', function () {
            if (onMarkerClick) {
              onMarkerClick(attraction);
            }
            setSelectedAttraction(attraction);

            const content = `
              <div style="padding:8px;width:220px;">
                <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:bold;">${attraction.name}</h3>
                <p style="margin:0;font-size:12px;color:#666;">
                  ${attraction.type === 'indoor' ? '실내' :
                attraction.type === 'outdoor' ? '야외' : '실내/야외'}
                </p>
              </div>
            `;

            const infoWindow = new window.kakao.maps.InfoWindow({
              content: content,
              removable: true
            });

            infoWindow.open(map, marker);
          });
        });
        
        setIsLoading(false);
        return;
      }

      // 캐시된 데이터가 없을 경우에만 API 호출
      const response = await axios.get('/api/attractions/all');

      if (response.data.attractions) {
        const allAttractions = response.data.attractions;
        setAllAttractionsCached(allAttractions); // 데이터 캐시

        // 부모 컴포넌트에 관광지 목록 전달
        if (onAllAttractionsLoad) {
          onAllAttractionsLoad(allAttractions);
        }

        // 관광지 마커 생성
        allAttractions.forEach(attraction => {
          const coords = attraction.location.coordinates;
          const position = new window.kakao.maps.LatLng(coords[1], coords[0]);

          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            position: position,
            map: map,
            title: attraction.name
          });

          // 마커 참조 저장
          markersRef.current.push(marker);

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(marker, 'click', function () {
            if (onMarkerClick) {
              onMarkerClick(attraction);
            }
            setSelectedAttraction(attraction);

            const content = `
              <div style="padding:8px;width:220px;">
                <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:bold;">${attraction.name}</h3>
                <p style="margin:0;font-size:12px;color:#666;">
                  ${attraction.type === 'indoor' ? '실내' :
                attraction.type === 'outdoor' ? '야외' : '실내/야외'}
                </p>
              </div>
            `;

            const infoWindow = new window.kakao.maps.InfoWindow({
              content: content,
              removable: true
            });

            infoWindow.open(map, marker);
          });
        });
      }
    } catch (error) {
      console.error('관광지 정보 가져오기 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onMarkerClick, onAllAttractionsLoad, allAttractionsCached]);

  // 주변 관광지 정보 가져오기
  const fetchNearbyAttractions = useCallback(async (location, map, radius = 3) => {
    if (!location || !map) return;

    setIsLoading(true);

    try {
      // 이전 마커 제거
      clearMarkers();

      const response = await axios.get('/api/attractions', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: radius,
          limit: 20
        }
      });

      if (response.data.attractions) {
        const newAttractions = response.data.attractions;

        // 부모 컴포넌트에 관광지 목록 전달
        if (onNearbyAttractionsLoad) {
          onNearbyAttractionsLoad(newAttractions);
        }

        // 현재 위치 마커 표시
        const locationMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(location.latitude, location.longitude),
          map: map,
          title: '현재 위치'
        });

        // 마커 참조 저장 (현재 위치 마커도 포함)
        markersRef.current.push(locationMarker);

        // 관광지 마커 생성
        newAttractions.forEach(attraction => {
          const coords = attraction.location.coordinates;
          const position = new window.kakao.maps.LatLng(coords[1], coords[0]);

          const marker = new window.kakao.maps.Marker({
            position: position,
            map: map,
            title: attraction.name
          });

          markersRef.current.push(marker);

          window.kakao.maps.event.addListener(marker, 'click', function () {
            if (onMarkerClick) {
              onMarkerClick(attraction);
            }
            setSelectedAttraction(attraction);

            const content = `
              <div style="padding:8px;width:220px;">
                <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:bold;">${attraction.name}</h3>
                <p style="margin:0;font-size:12px;color:#666;">
                  ${attraction.type === 'indoor' ? '실내' :
                attraction.type === 'outdoor' ? '야외' : '실내/야외'}
                </p>
                <p style="margin:4px 0 0 0;font-size:12px;color:#333;">
                  ${(attraction.distanceKm || 0).toFixed(1)}km
                </p>
              </div>
            `;

            const infoWindow = new window.kakao.maps.InfoWindow({
              content: content,
              removable: true
            });

            infoWindow.open(map, marker);
          });
        });

        // 현재 위치 정보 창
        const infoContent = '<div style="padding:5px;width:150px;text-align:center;"><strong>현재 위치</strong></div>';
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: infoContent
        });
        infoWindow.open(map, locationMarker);
      }
    } catch (error) {
      console.error('관광지 정보 가져오기 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [clearMarkers, onMarkerClick, onNearbyAttractionsLoad]);

  // 현재 위치로 이동 및 주변 정보 표시
  const moveToCurrentLocation = useCallback(() => {
    if (!mapInstanceRef.current || !center) return;

    // 지도 중앙 위치 변경
    const newCenter = new window.kakao.maps.LatLng(center.latitude, center.longitude);
    mapInstanceRef.current.setCenter(newCenter);

    // 현재 위치 마커 표시
    const locationMarker = new window.kakao.maps.Marker({
      position: newCenter,
      map: mapInstanceRef.current,
      title: '현재 위치'
    });

    // 현재 위치 정보 창
    const infoContent = '<div style="padding:5px;width:150px;text-align:center;"><strong>현재 위치</strong></div>';
    const infoWindow = new window.kakao.maps.InfoWindow({
      content: infoContent
    });
    infoWindow.open(mapInstanceRef.current, locationMarker);

    // 주변 관광지 정보 가져오기
    fetchNearbyAttractions(center, mapInstanceRef.current);

  }, [center, fetchNearbyAttractions]);

  // 카카오맵 초기화 (한 번만 실행)
  useEffect(() => {
    // 서버 사이드 렌더링 방지
    if (typeof window === 'undefined' || !mapRef.current) return;

    // 이미 초기화된 경우 다시 실행하지 않음
    if (isMapInitializedRef.current) return;

    // 지도가 이미 초기화되었는지 확인
    if (!window.kakao?.maps) {
      console.error('카카오맵 SDK가 로드되지 않았습니다.');
      return;
    }

    const timer = debounceTimerRef.current;

    // 처음 초기화하는 경우에만 실행
    window.kakao.maps.load(() => {
      try {
        // 지도 옵션
        const options = {
          center: new window.kakao.maps.LatLng(
            center?.latitude || 37.5665,
            center?.longitude || 126.9780
          ),
          level: 5
        };

        // 지도 인스턴스 생성
        const map = new window.kakao.maps.Map(mapRef.current, options);
        mapInstanceRef.current = map;

        // 지도 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

        isMapInitializedRef.current = true;

        if (center) {
          const locationMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(center.latitude, center.longitude),
            map: map,
            title: '현재 위치'
          });

          const infoContent = '<div style="padding:5px;width:150px;text-align:center;"><strong>현재 위치</strong></div>';
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: infoContent
          });
          infoWindow.open(map, locationMarker);
        }

        setTimeout(() => {
          fetchAllAttractions(map);
        }, 1000);
      } catch (error) {
        console.error('카카오맵 초기화 중 오류 발생:', error);
      }
    });

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      clearMarkers();
    };
  }, [center, clearMarkers, fetchAllAttractions]);

  // 관광지 목록 클릭 시 상세 정보 표시 (부모 컴포넌트에서 호출 가능)
  const handleAttractionClick = useCallback((attraction) => {
    setSelectedAttraction(attraction);
  }, []);

  // 선택한 관광지 상세 정보 닫기
  const handleCloseDetail = useCallback(() => {
    setSelectedAttraction(null);
    if (onCloseDetail) {
      onCloseDetail();
    }
  }, [onCloseDetail]);

  // 부모 컴포넌트에서 호출할 수 있도록 함수 노출  // 0414 searchBar 지도중심이동 및 임의마커생성
  const searchMarkerRef = useRef(null); // 🔸 추가: 검색 마커 저장용

  useImperativeHandle(ref, () => ({
    handleAttractionClick,
    moveToCurrentLocation,
    fetchAllAttractions: (map) => fetchAllAttractions(map || mapInstanceRef.current),
    moveToCoords: (lat, lng) => {
      if (!mapInstanceRef.current) return;
      const center = new window.kakao.maps.LatLng(lat, lng);
      mapInstanceRef.current.setCenter(center);
    },
    addSearchMarker: (lat, lng) => {
      if (!mapInstanceRef.current) return;

      // 기존 마커 제거
      if (searchMarkerRef.current) {
        searchMarkerRef.current.setMap(null);
      }

      // 새 마커 생성
      const position = new window.kakao.maps.LatLng(lat, lng);
      const marker = new window.kakao.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: '검색 위치'
      });

      searchMarkerRef.current = marker;
    },
    mapInstance: mapInstanceRef.current, // ✅ 추가
    mapReady: true  
  }), [handleAttractionClick, moveToCurrentLocation, fetchAllAttractions]);

  // isNearbyMode가 변경될 때 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateMarkers = async () => {
      clearMarkers();

      if (isNearbyMode) {
        if (center) {
          await fetchNearbyAttractions(center, mapInstanceRef.current);
        }
      } else {
        await fetchAllAttractions(mapInstanceRef.current);
      }
    };

    updateMarkers();
  }, [isNearbyMode, center, clearMarkers, fetchAllAttractions, fetchNearbyAttractions]);

  return (
    <div className={styles.mapContainer}>
      {selectedAttraction && (
        <AttractionDetail
          attraction={selectedAttraction}
          onClose={handleCloseDetail}
        />
      )}
      <div ref={mapRef} className={styles.mapContent}></div>
      {isLoading && (
        <div className={styles.mapLoadingOverlay}>
          <div className={styles.mapLoadingSpinner}></div>
          <p>관광지 불러오는 중...</p>
        </div>
      )}
    </div>
  );
});

KakaoMap.displayName = 'KakaoMap';

export default KakaoMap; 