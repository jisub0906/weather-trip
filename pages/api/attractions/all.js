import { getDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '허용되지 않는 메서드입니다.' });
  }

  try {
    const db = await getDatabase();
    const attractions = db.collection('attractions');
    
    console.log('모든 관광지 데이터 요청');
    
    // 모든 관광지 가져오기 (제한 없이)
    const results = await attractions.find({}).toArray();
    
    console.log(`검색 결과: ${results.length}개 관광지 찾음`);
    
    return res.status(200).json({
      count: results.length,
      attractions: results
    });
  } catch (error) {
    console.error('관광지 검색 오류:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.stack });
  }
} 