/**
 * 두 지점 간의 거리를 계산합니다 (Haversine 공식 사용).
 * @param {number} lat1 - 시작점의 위도
 * @param {number} lon1 - 시작점의 경도
 * @param {number} lat2 - 도착점의 위도
 * @param {number} lon2 - 도착점의 경도
 * @returns {number} 두 지점 간의 거리 (km)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * 현재 위치를 기준으로 관광지들의 거리를 계산하고 정렬합니다.
 * @param {Array} attractions - 관광지 배열
 * @param {Object} userLocation - 사용자의 현재 위치 {latitude, longitude}
 * @returns {Array} 거리가 계산되고 정렬된 관광지 배열
 */
export const calculateAttractionsDistance = (attractions, userLocation) => {
  if (!userLocation || !attractions) return attractions;

  return attractions.map(attraction => {
    let distance = null;
    if (userLocation && attraction.location?.coordinates) {
      distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        attraction.location.coordinates[1],
        attraction.location.coordinates[0]
      );
    }
    return { ...attraction, distance };
  }).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}; 