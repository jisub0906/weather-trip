import mongoose from 'mongoose';


const AttractionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '관광지 이름은 필수입니다.'],
    trim: true
  },
  description: {
    type: String,
    required: [true, '관광지 설명은 필수입니다.'],
  },
  address: {
    type: String,
    required: [true, '주소는 필수입니다.']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [경도, 위도]
      required: true
    }
  },

  // 대분류 관광지 카테고리
  categoryGroup: {
    type: String,
    required: true,
    enum: ['자연/힐링', '종교/역사/전통', '체험/학습/산업', '문화/예술', '캠핑/스포츠']
  },

  // 소분류 관광지 카테고리
  category: {
    type: String,
    required: true,
    enum: [ '자연', '힐링',
      '종교', '역사', '전통',
      '체험', '학습', '산업',
      '문화', '예술',
      '캠핑', '스포츠']
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: String,
    caption: String
  }],
  openingHours: {
    type: String,
    required: true
  },
  admissionFee: {
    adult: Number,
    child: Number,
    senior: Number
  },
  contact: {
    phone: String,
    website: String
  },
  facilities: [{
    type: String,
    enum: ['주차장', '화장실', '식당', '카페', '기념품점', '안내소', '휠체어접근가능']
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 위치 기반 쿼리를 위한 인덱스
AttractionSchema.index({ location: '2dsphere' });
// 인기 관광지 쿼리를 위한 인덱스
AttractionSchema.index({ likeCount: -1 });

export default mongoose.models.Attraction || mongoose.model('Attraction', AttractionSchema); 