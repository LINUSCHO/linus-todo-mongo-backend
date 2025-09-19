// CORS 문제 해결을 위한 추가 미들웨어
const handleCors = (req, res, next) => {
  const origin = req.headers.origin;
  
  // 개발 환경에서는 모든 origin 허용
  if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    // 프로덕션에서는 허용된 origin만 설정
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }
  
  // CORS 관련 헤더 설정
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-CSRF-Token'
  );
  res.header('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Count, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400'); // 24시간 캐시
  
  // Referrer Policy 설정 (strict-origin-when-cross-origin 문제 해결)
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 추가 보안 헤더
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy 설정
  res.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';");
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

// CORS 에러 로깅 미들웨어
const corsErrorHandler = (err, req, res, next) => {
  if (err.message === 'CORS 정책에 의해 차단되었습니다.') {
    console.error(`CORS 에러: ${req.headers.origin}에서 ${req.method} ${req.path} 요청이 차단되었습니다.`);
    res.status(403).json({
      success: false,
      message: 'CORS 정책에 의해 요청이 차단되었습니다.',
      error: 'CORS_ERROR',
      origin: req.headers.origin,
      method: req.method,
      path: req.path
    });
  } else {
    next(err);
  }
};

module.exports = {
  handleCors,
  corsErrorHandler
};
