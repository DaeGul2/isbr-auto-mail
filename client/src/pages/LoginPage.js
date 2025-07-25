import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithCode } from '../services/authService';

const LoginPage = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token } = await loginWithCode(code);
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      setError('잘못된 코드입니다.');
    }
  };

  return (
    <div>
      <h2>로그인 코드 입력</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="사내 코드 입력"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit">로그인</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LoginPage;
