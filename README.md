# Linus Todo MongoDB Backend

Node.js, Express, MongoDB를 사용한 할 일 관리 백엔드 API입니다.

## 🚀 시작하기

### 필수 요구사항
- Node.js (v14 이상)
- MongoDB (로컬 또는 MongoDB Atlas)

### 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
```bash
# config.env 파일을 복사하여 .env 파일 생성
cp config.env .env
```

3. 개발 서버 실행:
```bash
npm run dev
```

4. 프로덕션 서버 실행:
```bash
npm start
```

## 📁 프로젝트 구조

```
├── src/
│   ├── app.js              # 메인 애플리케이션 파일
│   ├── models/
│   │   └── Todo.js         # Todo 모델
│   ├── controllers/
│   │   └── todoController.js # Todo 컨트롤러
│   ├── routes/
│   │   └── todoRoutes.js   # Todo 라우트
│   └── middleware/         # 미들웨어 (향후 확장)
├── config.env              # 환경 변수 설정
├── package.json
└── README.md
```

## 🔗 API 엔드포인트

### 기본 정보
- **Base URL**: `http://localhost:3000`
- **API Prefix**: `/api`

### 할 일 관리 API

#### 1. 모든 할 일 조회
```
GET /api/todos
```

**쿼리 파라미터:**
- `completed`: 완료 상태 필터 (true/false)
- `priority`: 우선순위 필터 (low/medium/high)
- `search`: 제목/설명 검색
- `sortBy`: 정렬 기준 (createdAt, title, priority, dueDate)
- `sortOrder`: 정렬 순서 (asc/desc)

#### 2. 특정 할 일 조회
```
GET /api/todos/:id
```

#### 3. 새 할 일 생성
```
POST /api/todos
```

**요청 본문:**
```json
{
  "title": "할 일 제목",
  "description": "할 일 설명 (선택사항)",
  "priority": "medium",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "tags": ["태그1", "태그2"]
}
```

#### 4. 할 일 수정
```
PUT /api/todos/:id
```

#### 5. 완료 상태 토글
```
PATCH /api/todos/:id/toggle
```

#### 6. 할 일 삭제
```
DELETE /api/todos/:id
```

## 🛠️ 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Environment**: dotenv
- **CORS**: cors
- **Development**: nodemon

## 📝 환경 변수

`config.env` 파일에서 다음 변수들을 설정할 수 있습니다:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/linus-todo
NODE_ENV=development
```

## 🗄️ 데이터 모델

### Todo 스키마

```javascript
{
  title: String (필수, 최대 100자),
  description: String (선택, 최대 500자),
  completed: Boolean (기본값: false),
  priority: String (low/medium/high, 기본값: medium),
  dueDate: Date (선택),
  tags: [String],
  createdAt: Date (자동 생성),
  updatedAt: Date (자동 갱신)
}
```

## 🔍 응답 형식

모든 API 응답은 다음과 같은 형식을 따릅니다:

### 성공 응답
```json
{
  "success": true,
  "message": "성공 메시지",
  "data": { /* 응답 데이터 */ },
  "count": 10 // 목록 조회 시에만 포함
}
```

### 에러 응답
```json
{
  "success": false,
  "message": "에러 메시지",
  "error": "상세 에러 정보"
}
```

## 🚀 개발 팁

1. **개발 모드 실행**: `npm run dev`를 사용하면 파일 변경 시 자동으로 서버가 재시작됩니다.

2. **MongoDB 연결**: 로컬 MongoDB를 사용하거나 MongoDB Atlas를 사용할 수 있습니다.

3. **API 테스트**: Postman, Insomnia, 또는 curl을 사용하여 API를 테스트할 수 있습니다.

## 📄 라이선스

ISC
