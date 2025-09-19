# 📋 할일 생성 API 가이드

## 🚀 기본 정보
- **Base URL**: `http://localhost:5000`
- **API Prefix**: `/api/todos`

## 📝 할일 생성 API 엔드포인트

### 1. 완전한 할일 생성
```http
POST /api/todos
Content-Type: application/json

{
  "title": "프로젝트 완료하기",
  "description": "React 프로젝트 마무리 작업",
  "priority": "high",
  "category": "업무",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "tags": ["프로젝트", "React", "중요"],
  "status": "pending",
  "progress": 0,
  "repeat": {
    "type": "none",
    "interval": 1
  },
  "notes": [
    {
      "content": "API 연동이 가장 중요하다"
    }
  ]
}
```

**응답:**
```json
{
  "success": true,
  "message": "할 일이 성공적으로 생성되었습니다.",
  "data": {
    "_id": "...",
    "title": "프로젝트 완료하기",
    "description": "React 프로젝트 마무리 작업",
    "priority": "high",
    "category": "업무",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "tags": ["프로젝트", "React", "중요"],
    "status": "pending",
    "progress": 0,
    "completed": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 빠른 할일 생성 (제목만으로)
```http
POST /api/todos/quick
Content-Type: application/json

{
  "title": "빨래하기"
}
```

**응답:**
```json
{
  "success": true,
  "message": "할 일이 빠르게 생성되었습니다.",
  "data": {
    "_id": "...",
    "title": "빨래하기",
    "priority": "medium",
    "status": "pending",
    "progress": 0,
    "completed": false
  }
}
```

### 3. 템플릿으로 할일 생성
```http
POST /api/todos/template/work
Content-Type: application/json

{
  "title": "회의 준비하기",
  "dueDate": "2024-01-15T09:00:00.000Z",
  "tags": ["회의", "준비"]
}
```

**사용 가능한 템플릿:**
- `work`: 업무 작업
- `personal`: 개인 일정
- `urgent`: 긴급 작업
- `study`: 학습

**응답:**
```json
{
  "success": true,
  "message": "템플릿 \"work\"에서 할 일이 생성되었습니다.",
  "data": {
    "_id": "...",
    "title": "회의 준비하기",
    "priority": "medium",
    "category": "업무",
    "tags": ["업무", "회의", "준비"],
    "dueDate": "2024-01-15T09:00:00.000Z"
  }
}
```

### 4. 대량 할일 생성
```http
POST /api/todos/bulk
Content-Type: application/json

{
  "todos": [
    {
      "title": "할일 1",
      "priority": "high",
      "category": "업무"
    },
    {
      "title": "할일 2",
      "priority": "medium",
      "category": "개인"
    },
    {
      "title": "할일 3",
      "priority": "low",
      "category": "학습"
    }
  ]
}
```

**응답:**
```json
{
  "success": true,
  "message": "3개의 할일이 생성되었습니다.",
  "data": [
    {
      "_id": "...",
      "title": "할일 1",
      "priority": "high",
      "category": "업무"
    },
    {
      "_id": "...",
      "title": "할일 2",
      "priority": "medium",
      "category": "개인"
    },
    {
      "_id": "...",
      "title": "할일 3",
      "priority": "low",
      "category": "학습"
    }
  ],
  "summary": {
    "total": 3,
    "created": 3,
    "failed": 0
  }
}
```

### 5. 할일 복사
```http
POST /api/todos/64f1a2b3c4d5e6f7g8h9i0j1/duplicate
Content-Type: application/json

{
  "modifications": {
    "title": "복사된 할일",
    "dueDate": "2024-02-01T00:00:00.000Z"
  }
}
```

**응답:**
```json
{
  "success": true,
  "message": "할일이 성공적으로 복사되었습니다.",
  "data": {
    "_id": "...",
    "title": "복사된 할일",
    "description": "원본 할일의 설명",
    "priority": "medium",
    "dueDate": "2024-02-01T00:00:00.000Z",
    "status": "pending",
    "progress": 0
  }
}
```

## 🔍 필드 설명

### 필수 필드
- `title` (String): 할일 제목 (최대 200자)

### 선택 필드
- `description` (String): 할일 설명 (최대 1000자)
- `priority` (String): 우선순위
  - `low`: 낮음
  - `medium`: 보통 (기본값)
  - `high`: 높음
  - `urgent`: 긴급
- `category` (String): 카테고리 (최대 50자)
- `dueDate` (Date): 마감일 (ISO 8601 형식)
- `tags` (Array[String]): 태그 목록 (각 태그 최대 20자)
- `status` (String): 상태
  - `pending`: 대기 (기본값)
  - `in_progress`: 진행중
  - `completed`: 완료
  - `cancelled`: 취소
- `progress` (Number): 진행률 (0-100)
- `repeat` (Object): 반복 설정
  - `type`: 반복 타입 (none, daily, weekly, monthly, yearly)
  - `interval`: 반복 간격 (기본값: 1)
  - `endDate`: 반복 종료일
- `notes` (Array[Object]): 메모 목록
  - `content`: 메모 내용

## ⚠️ 검증 규칙

1. **제목**: 필수, 최대 200자
2. **우선순위**: low, medium, high, urgent 중 하나
3. **상태**: pending, in_progress, completed, cancelled 중 하나
4. **진행률**: 0-100 사이의 숫자
5. **마감일**: 오늘 이후의 날짜만 허용
6. **태그**: 각 태그는 최대 20자
7. **카테고리**: 최대 50자
8. **대량 생성**: 한 번에 최대 50개

## 🚨 에러 응답

### 검증 오류
```json
{
  "success": false,
  "message": "입력 데이터 검증에 실패했습니다.",
  "errors": [
    "제목은 필수입니다.",
    "우선순위는 low, medium, high, urgent 중 하나여야 합니다."
  ]
}
```

### 일반 오류
```json
{
  "success": false,
  "message": "할 일 생성에 실패했습니다.",
  "error": "상세 오류 메시지"
}
```

## 💡 사용 팁

1. **빠른 생성**: 간단한 할일은 `/quick` 엔드포인트 사용
2. **템플릿 활용**: 반복되는 패턴의 할일은 템플릿 사용
3. **대량 생성**: 여러 할일을 한 번에 생성할 때 `/bulk` 사용
4. **할일 복사**: 비슷한 할일을 만들 때 `/duplicate` 사용
5. **진행률**: 100%로 설정하면 자동으로 완료 상태가 됩니다

## 🔧 테스트 예시

### cURL 명령어
```bash
# 기본 할일 생성
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "테스트 할일", "priority": "high"}'

# 빠른 할일 생성
curl -X POST http://localhost:5000/api/todos/quick \
  -H "Content-Type: application/json" \
  -d '{"title": "빠른 할일"}'

# 템플릿으로 생성
curl -X POST http://localhost:5000/api/todos/template/work \
  -H "Content-Type: application/json" \
  -d '{"title": "업무 할일"}'
```
