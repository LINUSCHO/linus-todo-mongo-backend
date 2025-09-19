const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { handleCors, corsErrorHandler } = require('./src/middleware/corsMiddleware');
const { securityHeaders, browserCompatibility, handlePreflight, developmentCors } = require('./src/middleware/securityMiddleware');
// 환경변수 로드 및 검증
const path = require('path');
const fs = require('fs');

// 환경변수 파일 로드
const envPath = path.resolve(__dirname, 'config.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn('config.env 파일을 찾을 수 없습니다. 기본 환경변수를 사용합니다.');
}

// 환경변수 검증 및 설정
const requiredEnvVars = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/linus-todo',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5001
};

// 환경변수 설정
Object.keys(requiredEnvVars).forEach(key => {
  if (!process.env[key]) {
    process.env[key] = requiredEnvVars[key];
  }
});

// 환경변수 디버깅
console.log('=== 환경변수 상태 ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '설정됨' : '기본값 사용');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('=====================');

const app = express();

// CORS 설정
const corsOptions = {
  origin: function (origin, callback) {
    // 개발 환경에서는 모든 origin 허용
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // 프로덕션에서는 환경 변수에서 허용된 도메인 목록 가져오기
      const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',')
        : [
            'http://localhost:3000',
            'http://localhost:5001',
            'http://localhost:5173',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5001',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:8080'
          ];
      
      // origin이 없거나 허용된 목록에 있으면 허용
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS 차단: ${origin}은 허용되지 않은 도메인입니다.`);
        callback(new Error('CORS 정책에 의해 차단되었습니다.'));
      }
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true' || true, // 쿠키와 인증 정보 허용
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-Requested-With'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Requested-With'],
  optionsSuccessStatus: 200, // 일부 레거시 브라우저 지원
  preflightContinue: false,
  maxAge: 86400 // preflight 캐시 시간 (24시간)
};

// 미들웨어 설정 (순서 중요!)
app.use(securityHeaders); // 보안 헤더 먼저 설정
app.use(browserCompatibility); // 브라우저 호환성
app.use(handlePreflight); // OPTIONS 요청 처리
app.use(cors(corsOptions)); // CORS 설정
app.use(handleCors); // 추가 CORS 미들웨어
app.use(developmentCors); // 개발 환경 CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 기타 보안 헤더 설정
app.use((req, res, next) => {
  // 기타 보안 헤더
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  next();
});

// MongoDB 연결
const connectToMongoDB = async () => {
  try {
    console.log('MongoDB 연결 시도 중...');
    console.log('연결 URI:', process.env.MONGODB_URI.substring(0, 30) + '...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5초 타임아웃
      connectTimeoutMS: 10000, // 10초 연결 타임아웃
    });
    
    console.log('✅ MongoDB 연결 성공!');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error.message);
    
    // 로컬 MongoDB로 폴백 시도
    if (process.env.MONGODB_URI.includes('mongodb+srv://')) {
      console.log('로컬 MongoDB로 폴백 시도 중...');
      try {
        await mongoose.connect('mongodb://localhost:27017/linus-todo');
        console.log('✅ 로컬 MongoDB 연결 성공!');
      } catch (localError) {
        console.error('❌ 로컬 MongoDB 연결도 실패:', localError.message);
      }
    }
  }
};

connectToMongoDB();

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Linus Todo MongoDB Backend 서버가 실행 중입니다!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// API 라우트
app.use('/api/todos', require('./src/routes/todoRoutes'));

// CORS 에러 핸들링
app.use(corsErrorHandler);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '서버 내부 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({
    message: '요청한 경로를 찾을 수 없습니다.',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5001; // 포트 번호를 5001번으로 설정

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV}`);
});

module.exports = app;
