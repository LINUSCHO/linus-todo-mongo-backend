# 🔗 API 경로 가이드

## ❌ 문제 상황
```
Request URL: http://localhost:5001/todos?sortBy=createdAt&sortOrder=desc
Status Code: 404 Not Found
```

## ✅ 해결 방법

### 올바른 API 경로
모든 API 엔드포인트는 `/api` 접두사가 필요합니다.

**❌ 잘못된 경로:**
```
http://localhost:5001/todos
```

**✅ 올바른 경로:**
```
http://localhost:5001/api/todos
```

## 📋 전체 API 엔드포인트 목록

### 기본 경로 구조
```
Base URL: http://localhost:5001
API Prefix: /api
```

### 할일 관리 API

#### 1. 조회 API
| 기능 | HTTP Method | 경로 | 설명 |
|------|-------------|------|------|
| 모든 할일 조회 | GET | `/api/todos` | 전체 할일 목록 |
| 특정 할일 조회 | GET | `/api/todos/:id` | ID로 특정 할일 |
| 통계 조회 | GET | `/api/todos/statistics` | 할일 통계 |
| 검색 | GET | `/api/todos/search` | 할일 검색 |
| 오늘의 할일 | GET | `/api/todos/today` | 오늘 마감 할일 |
| 이번 주 할일 | GET | `/api/todos/week` | 이번 주 할일 |
| 마감 초과 | GET | `/api/todos/overdue` | 마감일 초과 |
| 마감 임박 | GET | `/api/todos/due-soon` | 곧 마감인 할일 |
| 카테고리별 | GET | `/api/todos/category/:category` | 카테고리별 조회 |
| 우선순위별 | GET | `/api/todos/priority/:priority` | 우선순위별 조회 |
| 상태별 | GET | `/api/todos/status/:status` | 상태별 조회 |
| 태그별 | GET | `/api/todos/tag/:tag` | 태그별 조회 |

#### 2. 생성 API
| 기능 | HTTP Method | 경로 | 설명 |
|------|-------------|------|------|
| 새 할일 생성 | POST | `/api/todos` | 완전한 할일 생성 |
| 빠른 생성 | POST | `/api/todos/quick` | 제목만으로 생성 |
| 템플릿 생성 | POST | `/api/todos/template/:templateId` | 템플릿으로 생성 |
| 대량 생성 | POST | `/api/todos/bulk` | 여러 할일 생성 |
| 할일 복사 | POST | `/api/todos/:id/duplicate` | 할일 복사 |

#### 3. 수정/삭제 API
| 기능 | HTTP Method | 경로 | 설명 |
|------|-------------|------|------|
| 할일 수정 | PUT | `/api/todos/:id` | 할일 정보 수정 |
| 상태 토글 | PATCH | `/api/todos/:id/toggle` | 완료 상태 변경 |
| 할일 삭제 | DELETE | `/api/todos/:id` | 할일 삭제 |

## 🔧 사용 예시

### JavaScript Fetch API
```javascript
// ✅ 올바른 사용법
const response = await fetch('http://localhost:5001/api/todos', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
});

// ❌ 잘못된 사용법
const response = await fetch('http://localhost:5001/todos', {
  method: 'GET'
});
```

### Axios
```javascript
// ✅ 올바른 사용법
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // /api 포함
  withCredentials: true
});

// 할일 조회
const todos = await api.get('/todos');

// ❌ 잘못된 사용법
const api = axios.create({
  baseURL: 'http://localhost:5001', // /api 누락
  withCredentials: true
});
```

### cURL 명령어
```bash
# ✅ 올바른 사용법
curl "http://localhost:5001/api/todos?sortBy=createdAt&sortOrder=desc"

# ❌ 잘못된 사용법
curl "http://localhost:5001/todos?sortBy=createdAt&sortOrder=desc"
```

## 🌐 프론트엔드 프레임워크별 설정

### React
```javascript
// src/config/api.js
const API_BASE_URL = 'http://localhost:5001/api';

export const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options
  });
  return response.json();
};

// 사용
const todos = await apiCall('/todos');
```

### Vue.js
```javascript
// src/api/index.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true
});

export default api;

// 컴포넌트에서 사용
import api from '@/api';

export default {
  async mounted() {
    const response = await api.get('/todos');
    this.todos = response.data.data;
  }
}
```

### Angular
```typescript
// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5001/api';

  constructor(private http: HttpClient) {}

  getTodos() {
    return this.http.get(`${this.baseUrl}/todos`);
  }
}
```

## 🔍 문제 진단

### 404 오류 확인 방법
1. **브라우저 개발자 도구** → Network 탭에서 요청 URL 확인
2. **올바른 경로**: `/api/todos` ✅
3. **잘못된 경로**: `/todos` ❌

### 일반적인 오류 패턴
```bash
# 404 오류 - 경로 누락
GET http://localhost:5001/todos → 404 Not Found

# 성공 - 올바른 경로
GET http://localhost:5001/api/todos → 200 OK
```

## 📚 관련 문서

- `API_GUIDE.md`: 전체 API 사용법
- `TODO_VIEW_API.md`: 조회 API 상세 가이드
- `CLIENT_CORS_GUIDE.md`: CORS 설정 가이드

## 🎯 핵심 포인트

1. **모든 API 요청은 `/api` 접두사 필수**
2. **Base URL**: `http://localhost:5001`
3. **API Prefix**: `/api`
4. **전체 경로**: `http://localhost:5001/api/todos`

이제 올바른 API 경로를 사용하여 모든 기능을 정상적으로 사용할 수 있습니다! 🚀
