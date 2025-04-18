import { useState } from 'react';

const genderOptions = [
  { label: '남성', value: 'male' },
  { label: '여성', value: 'female' }
];

const countries = ['대한민국', '미국', '일본', '영국'];

const cities = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기도', '강원도', '충청북도', '충청남도',
  '전라북도', '전라남도', '경상북도', '경상남도', '제주도'
];

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nickname: '',
    gender: '',
    birthdate: '',
    phone1: '010',
    phone2: '',
    phone3: '',
    region: {
      country: '',
      city: ''
    }
  });

  const handleSubmit = async () => {
    const { name, email, password, nickname, phone1, phone2, phone3, gender, birthdate, region } = formData;

    if (!name.trim() || !email.trim() || !password.trim() || !nickname.trim() || !phone2.trim() || !phone3.trim()) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const fullPhone = `${phone1}-${phone2}-${phone3}`;

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          nickname: nickname.trim(),
          gender: gender || undefined,
          birthdate: birthdate || undefined,
          phone: fullPhone,
          region: region?.country ? {
            country: region.country,
            city: region.city || undefined
          } : undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('🎉 회원가입이 완료되었습니다!');
        window.location.href = '/';
      } else {
        alert(`❗ 가입 실패: ${data.message}`);
      }
    } catch (error) {
      console.error('가입 요청 에러:', error);
      alert('❌ 서버 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>회원가입</h1>
      <form>
        <div>
          <label htmlFor="name">* 이름</label>
          <input id="name" type="text" value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>

        <div>
          <label htmlFor="email">* 이메일</label>
          <input id="email" type="email" value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>

        <div>
          <label htmlFor="password">* 비밀번호</label>
          <input id="password" type="password" value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })} />
          <small style={{ color: 'gray' }}>비밀번호는 최소 4자 이상이어야 합니다.</small>
        </div>

        <div>
          <label htmlFor="nickname">* 닉네임</label>
          <input id="nickname" type="text" value={formData.nickname}
            onChange={e => setFormData({ ...formData, nickname: e.target.value })} />
        </div>

        <div>
          <label>성별</label>
          <div>
            {genderOptions.map((option) => (
              <label key={option.value} htmlFor={option.value} style={{ marginRight: '1rem' }}>
                <input
                  type="radio"
                  id={option.value}
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="birthdate">생년월일</label>
          <input id="birthdate" type="date" value={formData.birthdate}
            onChange={e => setFormData({ ...formData, birthdate: e.target.value })} />
        </div>

        <div>
          <label>* 전화번호</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select value={formData.phone1}
              onChange={e => setFormData({ ...formData, phone1: e.target.value })}>
              <option value="010">010</option>
              <option value="011">011</option>
              <option value="016">016</option>
              <option value="017">017</option>
              <option value="018">018</option>
              <option value="019">019</option>
            </select>

            <input type="text" maxLength="4" placeholder="1234" value={formData.phone2}
              onChange={e => setFormData({ ...formData, phone2: e.target.value })} />

            <input type="text" maxLength="4" placeholder="5678" value={formData.phone3}
              onChange={e => setFormData({ ...formData, phone3: e.target.value })} />
          </div>
        </div>

        <div>
          <label htmlFor="country">국가</label>
          <select id="country" value={formData.region.country}
            onChange={e => setFormData({
              ...formData,
              region: {
                ...formData.region,
                country: e.target.value,
                city: ''
              }
            })}>
            <option value="">국가 선택</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="city">도시</label>
          <select id="city" disabled={formData.region.country !== '대한민국'}
            value={formData.region.city}
            onChange={e => setFormData({
              ...formData,
              region: {
                ...formData.region,
                city: e.target.value
              }
            })}>
            <option value="">도시 선택</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button type="button" onClick={handleSubmit}>가입하기</button>
          <button type="button" style={{ marginLeft: '1rem' }}
            onClick={() => {
              const confirmLeave = window.confirm('이 페이지에서 벗어나시겠습니까? 현재 입력된 정보값들이 초기화 됩니다.');
              if (confirmLeave) window.location.href = '/';
            }}>
            돌아가기
          </button>
        </div>

        <p style={{ marginTop: '1rem', color: 'gray', fontSize: '0.9rem' }}>* 표시는 필수 입력 항목입니다.</p>
      </form>
    </div>
  );
}