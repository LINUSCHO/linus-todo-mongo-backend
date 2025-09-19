# 📋 할일 조회 API 가이드

## 🚀 기본 정보
- **Base URL**: `http://localhost:5000`
- **API Prefix**: `/api/todos`

## 🔍 할일 조회 API 엔드포인트

### 1. 모든 할일 조회 (고급 필터링)
```http
GET /api/todos?page=1&limit=20&priority=high&status=pending&search=프로젝트
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `completed`: 완료 상태 (true/false)
- `priority`: 우선순위 (low, medium, high, urgent)
- `category`: 카테고리
- `status`: 상태 (pending, in_progress, completed, cancelled)
- `tags`: 태그 (배열 또는 단일 값)
- `search`: 검색어 (제목, 설명, 카테고리에서 검색)
- `dueDate`: 마감일 기준 (YYYY-MM-DD 형식)
- `progressMin`: 최소 진행률 (0-100)
- `progressMax`: 최대 진행률 (0-100)
- `sortBy`: 정렬 기준 (createdAt, title, priority, dueDate, progress)
- `sortOrder`: 정렬 순서 (asc, desc)

**응답:**
```json
{
  "success": true,
  "count": 5,
  "totalCount": 25,
  "page": 1,
  "totalPages": 2,
  "data": [
    {
      "_id": "...",
      "title": "프로젝트 완료하기",
      "description": "React 프로젝트 마무리",
      "priority": "high",
      "status": "in_progress",
      "progress": 75,
      "category": "업무",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "tags": ["프로젝트", "React"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. 할일 통계 조회
```http
GET /api/todos/statistics
```

**응답:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "completed": 60,
    "pending": 25,
    "inProgress": 12,
    "overdue": 3,
    "completionRate": 60,
    "overdueRate": 3,
    "active": 37
  }
}
```

### 3. 할일 검색
```http
GET /api/todos/search?q=프로젝트&type=title&limit=10
```

**쿼리 파라미터:**
- `q`: 검색어 (필수)
- `type`: 검색 타입 (all, title, description, category, tags)
- `limit`: 결과 수 제한 (기본값: 20)

**응답:**
```json
{
  "success": true,
  "count": 3,
  "query": "프로젝트",
  "type": "title",
  "data": [
    {
      "_id": "...",
      "title": "프로젝트 완료하기",
      "priority": "high",
      "status": "in_progress"
    }
  ]
}
```

### 4. 오늘의 할일 조회
```http
GET /api/todos/today?priority=high&status=pending
```

**쿼리 파라미터:**
- `status`: 상태 필터
- `priority`: 우선순위 필터
- `sortBy`: 정렬 기준 (기본값: priority)
- `sortOrder`: 정렬 순서 (기본값: desc)

**응답:**
```json
{
  "success": true,
  "count": 5,
  "message": "오늘 마감인 할일 목록입니다.",
  "date": "2024-01-15",
  "data": [
    {
      "_id": "...",
      "title": "중요한 회의",
      "priority": "urgent",
      "dueDate": "2024-01-15T14:00:00.000Z"
    }
  ]
}
```

### 5. 이번 주 할일 조회
```http
GET /api/todos/week?status=in_progress
```

**응답:**
```json
{
  "success": true,
  "count": 12,
  "message": "이번 주 할일 목록입니다.",
  "weekStart": "2024-01-14",
  "weekEnd": "2024-01-20",
  "data": [
    {
      "_id": "...",
      "title": "주간 보고서 작성",
      "dueDate": "2024-01-18T17:00:00.000Z"
    }
  ]
}
```

### 6. 마감일 초과된 할일 조회
```http
GET /api/todos/overdue?sortBy=dueDate&sortOrder=asc&limit=20
```

**응답:**
```json
{
  "success": true,
  "count": 3,
  "message": "마감일이 초과된 할일 목록입니다.",
  "data": [
    {
      "_id": "...",
      "title": "지연된 작업",
      "dueDate": "2024-01-10T00:00:00.000Z",
      "isOverdue": true,
      "daysUntilDue": -5
    }
  ]
}
```

### 7. 곧 마감인 할일 조회
```http
GET /api/todos/due-soon?days=3&limit=10
```

**쿼리 파라미터:**
- `days`: 마감일까지 남은 일수 (기본값: 3)
- `sortBy`: 정렬 기준 (기본값: dueDate)
- `sortOrder`: 정렬 순서 (기본값: asc)
- `limit`: 결과 수 제한

**응답:**
```json
{
  "success": true,
  "count": 7,
  "message": "3일 이내에 마감인 할일 목록입니다.",
  "days": 3,
  "data": [
    {
      "_id": "...",
      "title": "마감 임박 작업",
      "dueDate": "2024-01-17T23:59:59.000Z",
      "isDueSoon": true,
      "daysUntilDue": 2
    }
  ]
}
```

### 8. 카테고리별 할일 조회
```http
GET /api/todos/category/업무?sortBy=priority&sortOrder=desc
```

**응답:**
```json
{
  "success": true,
  "count": 15,
  "category": "업무",
  "data": [
    {
      "_id": "...",
      "title": "업무 보고서",
      "category": "업무",
      "priority": "high"
    }
  ]
}
```

### 9. 우선순위별 할일 조회
```http
GET /api/todos/priority/urgent?limit=5
```

**응답:**
```json
{
  "success": true,
  "count": 3,
  "priority": "urgent",
  "data": [
    {
      "_id": "...",
      "title": "긴급 작업",
      "priority": "urgent",
      "status": "in_progress"
    }
  ]
}
```

### 10. 상태별 할일 조회
```http
GET /api/todos/status/in_progress?sortBy=createdAt&sortOrder=desc
```

**응답:**
```json
{
  "success": true,
  "count": 8,
  "status": "in_progress",
  "data": [
    {
      "_id": "...",
      "title": "진행 중인 작업",
      "status": "in_progress",
      "progress": 45
    }
  ]
}
```

### 11. 태그별 할일 조회
```http
GET /api/todos/tag/React?limit=10
```

**응답:**
```json
{
  "success": true,
  "count": 6,
  "tag": "React",
  "data": [
    {
      "_id": "...",
      "title": "React 프로젝트",
      "tags": ["React", "프론트엔드"],
      "category": "개발"
    }
  ]
}
```

### 12. 특정 할일 조회
```http
GET /api/todos/64f1a2b3c4d5e6f7g8h9i0j1
```

**응답:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "title": "상세한 할일",
    "description": "할일에 대한 자세한 설명",
    "priority": "high",
    "status": "in_progress",
    "progress": 60,
    "category": "업무",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "tags": ["중요", "업무"],
    "notes": [
      {
        "content": "중요한 메모",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "isOverdue": false,
    "daysUntilDue": 16,
    "isDueSoon": false,
    "completionRate": 60
  }
}
```

## 🔧 고급 필터링 예시

### 복합 필터링
```http
GET /api/todos?priority=high&status=in_progress&category=업무&progressMin=50&sortBy=dueDate&sortOrder=asc&page=1&limit=10
```

### 날짜 범위 필터링
```http
GET /api/todos?dueDate=2024-01-31&progressMin=0&progressMax=50
```

### 다중 태그 검색
```http
GET /api/todos?tags=React&tags=프론트엔드&status=pending
```

## 📊 정렬 옵션

### 정렬 기준 (sortBy)
- `createdAt`: 생성일시
- `updatedAt`: 수정일시
- `title`: 제목 (알파벳순)
- `priority`: 우선순위
- `dueDate`: 마감일
- `progress`: 진행률
- `status`: 상태

### 정렬 순서 (sortOrder)
- `asc`: 오름차순
- `desc`: 내림차순

## 🚨 에러 응답

### 404 에러 (할일 없음)
```json
{
  "success": false,
  "message": "해당 할일을 찾을 수 없습니다."
}
```

### 400 에러 (잘못된 파라미터)
```json
{
  "success": false,
  "message": "유효하지 않은 우선순위입니다.",
  "validPriorities": ["low", "medium", "high", "urgent"]
}
```

## 💡 사용 팁

1. **페이지네이션**: 대량 데이터 조회 시 `page`와 `limit` 사용
2. **성능 최적화**: 필요한 필드만 조회하고 적절한 `limit` 설정
3. **검색 최적화**: `type` 파라미터로 검색 범위 제한
4. **정렬 활용**: `sortBy`와 `sortOrder`로 원하는 순서로 정렬
5. **통계 활용**: `/statistics` 엔드포인트로 대시보드 데이터 구성

## 🔧 테스트 예시

### cURL 명령어
```bash
# 모든 할일 조회
curl "http://localhost:5000/api/todos?page=1&limit=10"

# 통계 조회
curl "http://localhost:5000/api/todos/statistics"

# 검색
curl "http://localhost:5000/api/todos/search?q=프로젝트&type=title"

# 오늘의 할일
curl "http://localhost:5000/api/todos/today"

# 우선순위별 조회
curl "http://localhost:5000/api/todos/priority/high"

# 카테고리별 조회
curl "http://localhost:5000/api/todos/category/업무"
```
