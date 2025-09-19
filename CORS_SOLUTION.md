# 🔧 CORS 및 strict-origin-when-cross-origin 문제 해결 가이드

## 🚨 문제 설명

`strict-origin-when-cross-origin` 오류는 브라우저의 보안 정책으로 인해 발생하는 CORS(Cross-Origin Resource Sharing) 문제입니다. 이 문제는 다음과 같은 상황에서 발생합니다:

- 다른 도메인에서 API 요청 시
- Referrer Policy가 제한적인 경우
- 브라우저가 요청의 출처를 제한하는 경우

## ✅ 해결 방법

### 1. 서버 측 CORS 설정

#### 기본 CORS 설정
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'development') {
      callback(null, true); // 개발 환경에서는 모든 origin 허용
    } else {
      // 프로덕션에서는 특정 도메인만 허용
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS 정책에 의해 차단되었습니다.'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  optionsSuccessStatus: 200
};
```

#### 추가 보안 헤더 설정
```javascript
app.use((req, res, next) => {
  // Referrer Policy 설정
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS 헤더 명시적 설정
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 보안 헤더
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  next();
});
```

### 2. 환경 변수 설정

#### config.env 파일
```env
# CORS 설정
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
CORS_CREDENTIALS=true
NODE_ENV=development
```

### 3. 클라이언트 측 설정

#### Fetch API 사용 시
```javascript
const response = await fetch('http://localhost:5000/api/todos', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // 쿠키 포함
  mode: 'cors' // CORS 모드 명시
});
```

#### Axios 사용 시
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // 쿠키 포함
  headers: {
    'Content-Type': 'application/json',
  }
});
```

#### React에서 설정
```javascript
// package.json에 proxy 설정 추가
{
  "name": "frontend-app",
  "version": "0.1.0",
  "proxy": "http://localhost:5000"
}
```

### 4. 브라우저별 해결 방법

#### Chrome 개발자 도구
1. F12로 개발자 도구 열기
2. Console 탭에서 다음 명령어 실행:
```javascript
// 임시로 CORS 정책 비활성화 (개발용)
chrome --disable-web-security --user-data-dir=/tmp/chrome_dev_test
```

#### Firefox
1. `about:config` 접속
2. `security.fileuri.strict_origin_policy`를 `false`로 설정

## 🔍 문제 진단

### 1. 브라우저 콘솔에서 확인
```javascript
// CORS 에러 메시지 예시
Access to fetch at 'http://localhost:5000/api/todos' from origin 'http://localhost:3000' 
has been blocked by CORS policy: The request client is not a secure context and the 
resource is in a more-private address space.
```

### 2. 네트워크 탭에서 확인
- OPTIONS 요청이 실패하는지 확인
- 응답 헤더에 CORS 관련 헤더가 있는지 확인

### 3. 서버 로그 확인
```javascript
// 서버에서 CORS 관련 로그 확인
console.warn(`CORS 차단: ${origin}은 허용되지 않은 도메인입니다.`);
```

## 🛠️ 고급 해결 방법

### 1. 프록시 서버 사용

#### package.json에 proxy 설정
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "proxy": "http://localhost:5000"
}
```

### 2. Webpack Dev Server 프록시 설정

#### webpack.config.js
```javascript
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
};
```

### 3. Nginx 프록시 설정

#### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # CORS 헤더 추가
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization";
    }
}
```

## 🚀 테스트 방법

### 1. 서버 테스트
```bash
# 서버 실행
npm run dev

# CORS 테스트
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:5000/api/todos
```

### 2. 클라이언트 테스트
```javascript
// 브라우저 콘솔에서 테스트
fetch('http://localhost:5000/api/todos', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## 📋 체크리스트

- [ ] 서버에서 CORS 미들웨어 설정 완료
- [ ] 허용된 Origin 목록에 클라이언트 도메인 추가
- [ ] credentials 옵션이 필요한 경우 true로 설정
- [ ] OPTIONS 요청에 대한 응답 처리 확인
- [ ] 클라이언트에서 credentials: 'include' 설정
- [ ] Referrer-Policy 헤더 설정 확인
- [ ] 개발 환경에서는 모든 origin 허용
- [ ] 프로덕션 환경에서는 특정 도메인만 허용

## 🎯 완료 확인

모든 설정이 완료되면 다음을 확인하세요:

1. **브라우저 콘솔**: CORS 에러가 사라졌는지 확인
2. **네트워크 탭**: OPTIONS 요청이 성공하는지 확인
3. **API 응답**: 정상적으로 데이터를 받아오는지 확인

## 🔗 참고 자료

- [MDN CORS 문서](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS)
- [Express CORS 미들웨어](https://github.com/expressjs/cors)
- [브라우저 보안 정책](https://web.dev/referrer-policy/)
