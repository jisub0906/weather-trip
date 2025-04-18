import { getUserFromCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  const userInfo = getUserFromCookie(req);

  if (userInfo) {
    return res.status(200).json({ success: true, user: userInfo });
  } else {
    return res.status(200).json({ success: false, user: null });
  }
}