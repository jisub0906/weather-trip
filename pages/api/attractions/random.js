import { getDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '허용되지 않는 메서드입니다.' });
  }

  try {
    const { limit = 10 } = req.query;
    const db = await getDatabase();
    const attractions = db.collection('attractions');

    // 이미지가 있는 관광지 중에서 랜덤으로 선택
    const pipeline = [
      {
        $match: {
          images: { $exists: true, $ne: [] } // 이미지가 있는 관광지만 선택
        }
      },
      {
        $sample: { size: parseInt(limit) } // 랜덤으로 limit 개수만큼 선택
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
  } catch (error) {
    console.error('랜덤 관광지 조회 오류:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
} 