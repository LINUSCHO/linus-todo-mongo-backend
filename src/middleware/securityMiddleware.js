// 보안 및 CORS 관련 미들웨어
const securityHeaders = (req, res, next) => {
  // Referrer Policy 설정 (strict-origin-when-cross-origin 문제 해결)
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');
  
  // Cross-Origin Embedder Policy
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Cross-Origin Opener Policy
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  
  // Cross-Origin Resource Policy
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Permissions Policy
  res.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
};

// 브라우저 호환성을 위한 추가 헤더
const browserCompatibility = (req, res, next) => {
  // Safari 및 구형 브라우저 호환성
  if (req.headers['user-agent'] && req.headers['user-agent'].includes('Safari')) {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  // Chrome 및 Edge 호환성
  if (req.headers['sec-fetch-mode']) {
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  }
  
  next();
};

// CORS preflight 요청 처리
const handlePreflight = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-CSRF-Token'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24시간
    res.status(200).end();
    return;
  }
  next();
};

// 개발 환경에서의 추가 설정
const developmentCors = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // 개발 환경에서는 더 관대한 CORS 설정
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // 개발 도구 지원
    res.header('Access-Control-Expose-Headers', 
      'X-Total-Count, X-Page-Count, X-Requested-With, X-Response-Time'
    );
  }
  next();
};

module.exports = {
  securityHeaders,
  browserCompatibility,
  handlePreflight,
  developmentCors
};
