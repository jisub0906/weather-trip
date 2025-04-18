import { getDatabase } from '../../lib/mongodb';
import { getRecommendedAttractionType } from '../../utils/weather';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '허용되지 않는 메서드입니다.' });
  }

  try {
    const { longitude, latitude, weatherCondition, radius: requestRadius, limit: requestLimit, random } = req.query;
    const db = await getDatabase();
    const attractions = db.collection('attractions');

    // 랜덤 모드일 경우
    if (random === 'true') {
      const pipeline = [
        {
          $match: {
            images: { $exists: true, $ne: [] }
          }
        },
        {
          $sample: { size: parseInt(requestLimit) || 10 }
        },
        {
          $project: {
            name: 1,
            address: 1,
            images: 1,
            description: 1,
            location: 1
          }
        }
      ];

      const results = await attractions.aggregate(pipeline).toArray();
      return res.status(200).json({
        count: results.length,
        attractions: results
      });
    }
    
    // 기존 위치 기반 검색 로직
    if (!longitude || !latitude) {
      return res.status(400).json({ message: '위도와 경도가 필요합니다.' });
    }
    
    // 2dsphere 인덱스 생성 (인덱스가 없는 경우에만 생성됨)
    try {
      await attractions.createIndex({ "location": "2dsphere" });
      console.log("2dsphere 인덱스 생성 완료");
    } catch (indexError) {
      console.error("인덱스 생성 오류:", indexError);
    }
    
    // 날씨 조건에 따른 관광지 타입 설정
    const attractionType = getRecommendedAttractionType(weatherCondition || 'Clear');
    
    // 검색 반경 (km) - 요청에서 받거나 기본값 사용
    const radius = requestRadius 
      ? parseFloat(requestRadius) 
      : parseFloat(process.env.NEXT_PUBLIC_SEARCH_RADIUS) || 5;
    
    // 결과 제한 - 요청에서 받거나 기본값 사용
    const limit = requestLimit 
      ? parseInt(requestLimit) 
      : parseInt(process.env.NEXT_PUBLIC_MAX_RESULTS) || 20;
    
    // 좌표 변환
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    // 타입에 따른 쿼리 구성
    let typeQuery = {};
    if (attractionType === 'indoor') {
      typeQuery = { type: { $in: ['indoor', 'both'] } };
    } else if (attractionType === 'outdoor') {
      typeQuery = { type: { $in: ['outdoor', 'both'] } };
    }
    
    // 로그에 쿼리 정보 추가
    console.log(`검색 요청: 위치(${lng}, ${lat}), 반경 ${radius}km, 제한 ${limit}개`);
    
    // $geoNear 사용 시 주의: 컬렉션에 2dsphere 인덱스가 있어야 함
    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          maxDistance: radius * 1000,
          spherical: true,
          query: typeQuery
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          location: 1,
          type: 1,
          description: 1,
          tags: 1,
          images: 1,
          distance: 1,
          distanceKm: { $divide: ["$distance", 1000] }
        }
      },
      { $limit: limit }
    ];
    
    let results;
    try {
      results = await attractions.aggregate(pipeline).toArray();
      console.log(`검색 결과: ${results.length}개 관광지 찾음`);
    } catch (dbError) {
      console.error('MongoDB 쿼리 오류:', dbError);
      
      // 대체 쿼리: 2dsphere 인덱스가 없는 경우를 위한 대체 방안
      if (dbError.message && dbError.message.includes('2dsphere')) {
        console.log('2dsphere 인덱스 없음, 대체 쿼리 사용');
        
        // $geoWithin을 사용한 대체 쿼리
        const query = {
          location: {
            $geoWithin: {
              $centerSphere: [[lng, lat], radius / 6371]
            }
          },
          ...typeQuery
        };
        
        results = await attractions.find(query).limit(limit).toArray();
        
        // 거리 계산 (Haversine 공식)
        results = results.map(attraction => {
          const coords = attraction.location.coordinates;
          const dLat = (coords[1] - lat) * Math.PI / 180;
          const dLon = (coords[0] - lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat * Math.PI / 180) * Math.cos(coords[1] * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = 6371 * c * 1000;
          
          return {
            ...attraction,
            distance: distance,
            distanceKm: distance / 1000
          };
        });
        
        // 거리순 정렬
        results.sort((a, b) => a.distance - b.distance);
        console.log(`대체 쿼리 결과: ${results.length}개 관광지 찾음`);
      } else {
        throw dbError;
      }
    }
    
    return res.status(200).json({
      weatherCondition,
      recommendedType: attractionType,
      count: results.length,
      radius: radius,
      attractions: results
    });
  } catch (error) {
    console.error('관광지 검색 오류:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.stack });
  }
}