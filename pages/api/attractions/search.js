// /pages/api/attractions/search.js
import { getDatabase } from '@/lib/mongodb';

export default async function handler(req, res) {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: '관광지명이 없습니다.' });
  }

  try {
    const db = await getDatabase();
    const attraction = await db.collection('attractions').findOne({
      $or: [
        { name: name },
        { 관광지명: name }
      ]
    });

    if (!attraction) {
      return res.status(404).json({ message: '해당 관광지를 찾을 수 없습니다.' });
    }

    return res.status(200).json({ attraction });
  } catch (error) {
    console.error('관광지 검색 오류:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
}
