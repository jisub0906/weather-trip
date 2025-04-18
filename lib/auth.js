import * as cookie from 'cookie'

export function getUserFromCookie(req) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const userInfo = cookies.userInfo ? JSON.parse(cookies.userInfo) : null;
    return userInfo;
  } catch (err) {
    console.error('쿠키 파싱 오류:', err);
    return null;
  }
}