import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            alert('로그인 성공!');
            window.location.href = '/';
        } else {
            alert(data.message || '로그인 실패');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>로그인</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <br /><br />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <br /><br />
                <button type="submit">로그인</button>
                <button
                    type="button"
                    style={{ marginLeft: '1rem' }}
                    onClick={() => {
                        const confirmLeave = window.confirm(
                            '이 페이지에서 벗어나시겠습니까? 현재 입력된 정보값들이 초기화 됩니다.'
                        );
                        if (confirmLeave) window.location.href = '/';
                    }}
                >
                    돌아가기
                </button>
            </form>
        </div>
    );
}