import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '허용되지 않는 메서드입니다.' });
  }

  await dbConnect();

  try {
    const {
      name,
      email,
      password,
      nickname,
      gender,
      birthdate,
      phone,
      region
    } = req.body;

    if (!name || !email || !password || !nickname || !phone) {
      return res.status(400).json({ message: '필수 항목을 모두 입력해주세요.' });
    }

    const userData = {
      name,
      email,
      password,
      nickname,
      phone
    };

    if (typeof gender === 'string' && gender.trim() !== '') {
      userData.gender = gender;
    }

    if (birthdate) {
      userData.birthdate = birthdate;
    }

    if (region?.country) {
      userData.region = {
        country: region.country,
        ...(region.city && { city: region.city })
      };
    }

    const newUser = await User.create(userData);

    return res.status(201).json({
      message: '회원가입 되었습니다.',
      userId: newUser._id
    });

  } catch (error) {
    if (error.code === 11000 || error.name === 'ValidationError') {
      const duplicatedFields = [
        ...(error.keyPattern ? Object.keys(error.keyPattern) : []),
        ...(error.errors ? Object.keys(error.errors) : [])
      ];

      const fullErrorString = JSON.stringify(error).toLowerCase();
      if (fullErrorString.includes('nickname') && !duplicatedFields.includes('nickname')) {
        duplicatedFields.push('nickname');
      }

      let messages = [];

      if (duplicatedFields.includes('nickname')) {
        messages.push('이미 사용 중인 닉네임입니다.');
      }

      if (duplicatedFields.includes('email') || duplicatedFields.includes('phone')) {
        messages.push('이미 가입된 이메일 또는 전화번호입니다.');
      }

      if (duplicatedFields.includes('password')) {
        messages.push('비밀번호는 최소 4자리 이상이어야 합니다.');
      }

      return res.status(409).json({
        message: messages.join('\n')
      });
    }

    return res.status(500).json({
      message: '서버 오류입니다.'
    });
  }
}