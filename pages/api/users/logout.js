import * as cookie from 'cookie';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', cookie.serialize('userInfo', '', {
    httpOnly: true,
    maxAge: -1, // 즉시 만료
    path: '/',  // 전체 경로에서 삭제
  }));

  return res.status(200).json({ message: '로그아웃 완료' });
}