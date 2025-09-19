const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB 연결 성공');
})
.catch((error) => {
  console.error('MongoDB 연결 실패:', error);
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Linus Todo MongoDB Backend 서버가 실행 중입니다!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// API 라우트
app.use('/api/todos', require('./routes/todoRoutes'));

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '서버 내부 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 핸들링
app.use('*', (req, res) => {
  res.status(404).json({
    message: '요청한 경로를 찾을 수 없습니다.',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV}`);
});

module.exports = app;
