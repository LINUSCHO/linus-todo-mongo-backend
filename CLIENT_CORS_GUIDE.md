# 🌐 클라이언트 CORS 및 strict-origin-when-cross-origin 해결 가이드

## 🚨 문제 해결 완료!

서버에서 `strict-origin-when-cross-origin` 문제를 완전히 해결했습니다. 이제 클라이언트에서 다음과 같이 설정하세요.

## ✅ 서버 정보
- **API 서버**: `http://localhost:5001`
- **API 경로**: `/api/todos` (주의: `/api` 접두사 필수!)
- **CORS 설정**: 완전히 구성됨
- **Referrer Policy**: `no-referrer-when-downgrade`로 설정
- **Cross-Origin 정책**: 완전히 허용

## 🔧 클라이언트 설정

### 1. React에서 사용

#### Fetch API
```javascript
const apiCall = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/todos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 중요: 쿠키 포함
      mode: 'cors', // 중요: CORS 모드 명시
      referrerPolicy: 'no-referrer-when-downgrade' // 중요: Referrer Policy 설정
    });
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('API 호출 오류:', error);
  }
};
```

#### Axios 설정
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true, // 쿠키 포함
  headers: {
    'Content-Type': 'application/json',
  },
  // CORS 관련 설정
  crossDomain: true,
  timeout: 10000,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // Referrer Policy 설정
    config.headers['Referrer-Policy'] = 'no-referrer-when-downgrade';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      console.error('CORS 오류:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Vue.js에서 사용

#### Axios 설정 (Vue 3)
```javascript
// src/api/index.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 전역 설정
api.defaults.headers.common['Referrer-Policy'] = 'no-referrer-when-downgrade';

export default api;
```

#### 컴포넌트에서 사용
```vue
<template>
  <div>
    <button @click="fetchTodos">할일 가져오기</button>
    <ul>
      <li v-for="todo in todos" :key="todo._id">
        {{ todo.title }}
      </li>
    </ul>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      todos: []
    };
  },
  methods: {
    async fetchTodos() {
      try {
        const response = await api.get('/todos');
        this.todos = response.data.data;
      } catch (error) {
        console.error('할일 가져오기 실패:', error);
      }
    }
  }
};
</script>
```

### 3. Angular에서 사용

#### HTTP Interceptor 설정
```typescript
// src/app/interceptors/cors.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CorsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // CORS 관련 헤더 추가
    const corsReq = req.clone({
      setHeaders: {
        'Referrer-Policy': 'no-referrer-when-downgrade',
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    return next.handle(corsReq);
  }
}
```

#### App Module 설정
```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CorsInterceptor } from './interceptors/cors.interceptor';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CorsInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

### 4. Vanilla JavaScript에서 사용

```javascript
// API 호출 함수
const apiCall = async (endpoint, options = {}) => {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Referrer-Policy': 'no-referrer-when-downgrade'
    },
    credentials: 'include',
    mode: 'cors'
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(`http://localhost:5001/api${endpoint}`, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// 사용 예시
const getTodos = () => apiCall('/todos');
const createTodo = (todo) => apiCall('/todos', {
  method: 'POST',
  body: JSON.stringify(todo)
});

// 호출
getTodos().then(data => console.log(data));
```

## 🔧 브라우저별 추가 설정

### Chrome/Edge
```javascript
// 개발자 도구 콘솔에서 실행 (개발용)
// CORS 정책 비활성화 (임시)
chrome --disable-web-security --user-data-dir=/tmp/chrome_dev_test
```

### Firefox
1. `about:config` 접속
2. `security.fileuri.strict_origin_policy`를 `false`로 설정

### Safari
```javascript
// Safari 개발자 메뉴에서 "Disable Cross-Origin Restrictions" 활성화
```

## 📋 테스트 방법

### 1. 브라우저 콘솔에서 테스트
```javascript
fetch('http://localhost:5001/api/todos', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  mode: 'cors'
})
.then(response => response.json())
.then(data => console.log('성공:', data))
.catch(error => console.error('오류:', error));
```

### 2. cURL로 테스트
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Content-Type: application/json" \
     -v http://localhost:5001/api/todos
```

## 🚨 문제 해결 체크리스트

- [ ] 서버가 `http://localhost:5001`에서 실행 중인가?
- [ ] 클라이언트에서 `credentials: 'include'` 설정했는가?
- [ ] `mode: 'cors'` 설정했는가?
- [ ] `Referrer-Policy` 헤더를 설정했는가?
- [ ] 브라우저 개발자 도구에서 CORS 오류가 없는가?

## 🎯 완료 확인

모든 설정이 완료되면:
1. **네트워크 탭**: OPTIONS 요청이 성공하는지 확인
2. **콘솔**: CORS 관련 오류가 없는지 확인
3. **API 응답**: 정상적으로 데이터를 받아오는지 확인

## 🔗 API 엔드포인트 목록

- `GET /api/todos` - 모든 할일 조회
- `POST /api/todos` - 새 할일 생성
- `GET /api/todos/statistics` - 통계 조회
- `GET /api/todos/today` - 오늘의 할일
- `GET /api/todos/search?q=검색어` - 검색

모든 엔드포인트에서 CORS 문제가 해결되었습니다! 🎉
