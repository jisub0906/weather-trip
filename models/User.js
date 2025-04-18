import mongoose from 'mongoose';

// ✅ 사용할 도시 리스트
const validCities = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기도', '강원도', '충청북도', '충청남도',
  '전라북도', '전라남도', '경상북도', '경상남도', '제주도'
];

// ✅ 전화번호 앞자리 enum
const validPhonePrefixes = ['010', '011', '016', '017', '018', '019'];

// ✅ 닉네임 숫자 시작 여부 검사
const startsWithNumber = (value) => /^\d/.test(value);

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '이름은 필수입니다.'],
    trim: true
  },

  email: {
    type: String,
    required: [true, '이메일은 필수입니다.'],
    unique: true,
    trim: true
  },

  password: {
    type: String,
    required: [true, '비밀번호는 필수입니다.'],
    minlength: [4, '비밀번호는 최소 4자리 이상이어야 합니다.'],
    validate: {
      validator: function (value) {
        return value !== this.email;
      },
      message: '비밀번호는 이메일과 같을 수 없습니다.'
    }
  },

  nickname: {
    type: String,
    required: [true, '닉네임은 필수입니다.'],
    unique: true,
    trim: true,
    minlength: [1, '닉네임은 최소 1글자 이상이어야 합니다.'],
    validate: {
      validator: function (value) {
        return !startsWithNumber(value);
      },
      message: '닉네임은 숫자로 시작할 수 없습니다.'
    }
  },

  gender: {
    type: String,
    enum: ['male', 'female'],
    required: false
  },

  birthdate: {
    type: Date,
    required: false
  },

  phone: {
    type: String,
    required: [true, '전화번호는 필수입니다.'],
    unique: true,
    trim: true,
    set: function (raw) {
      const digits = raw.replace(/\D/g, '');
      if (digits.length === 10) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length === 11) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
      }
      return raw;
    },
    validate: {
      validator: function (value) {
        const match = value.match(/^(\d{3})-(\d{3,4})-(\d{4})$/);
        return match && validPhonePrefixes.includes(match[1]);
      },
      message: '전화번호 형식이 올바르지 않습니다. (예: 01012345678)'
    }
  },

  region: {
    country: {
      type: String,
      enum: ['대한민국', '미국', '일본', '영국'],
      required: false
    },
    city: {
      type: String,
      enum: validCities,
      required: false
    }
  }
}, {
  timestamps: true
});

// ✅ 캐시 방지 (Next.js 환경 대응)
const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;