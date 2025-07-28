const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const { connectDB } = require('./db');

const emailRoutes = require('./routes/emailRoutes');
const emailResponseRoutes = require('./routes/emailResponseRoutes');
const projectRoutes = require('./routes/projectRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🔓 로그인 라우터 (인증 제외)
app.use('/api/auth', authRoutes);
app.use('/api/email-responses', emailResponseRoutes);

// 🔐 모든 API는 인증 필요 (auth 제외하고 아래 전부 보호)
app.use('/api', authMiddleware);

// ✅ 보호된 API들
app.use('/api/emails', emailRoutes);
app.use('/api/projects',projectRoutes);

// 🔐 보호된 테스트용 예시 라우트
app.get('/api/protected', (req, res) => {
  res.json({ message: '인증된 사용자만 접근 가능합니다.' });
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
