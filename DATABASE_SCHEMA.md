# 📋 할일 앱 데이터베이스 스키마

## 📊 Todo 컬렉션 스키마

### 기본 필드

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
|--------|------|------|--------|------|
| `title` | String | ✅ | - | 할일 제목 (최대 200자) |
| `description` | String | ❌ | - | 할일 설명 (최대 1000자) |
| `completed` | Boolean | ❌ | `false` | 완료 여부 |
| `priority` | String | ❌ | `medium` | 우선순위 (low, medium, high, urgent) |
| `category` | String | ❌ | - | 카테고리 (최대 50자) |
| `dueDate` | Date | ❌ | - | 마감일 |
| `tags` | Array[String] | ❌ | `[]` | 태그 목록 (각 태그 최대 20자) |

### 상태 관리 필드

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
|--------|------|------|--------|------|
| `status` | String | ❌ | `pending` | 상태 (pending, in_progress, completed, cancelled) |
| `progress` | Number | ❌ | `0` | 진행률 (0-100%) |
| `completedAt` | Date | ❌ | - | 완료된 날짜 |

### 반복 설정

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
|--------|------|------|--------|------|
| `repeat.type` | String | ❌ | `none` | 반복 타입 (none, daily, weekly, monthly, yearly) |
| `repeat.interval` | Number | ❌ | `1` | 반복 간격 |
| `repeat.endDate` | Date | ❌ | - | 반복 종료일 |

### 메모/노트

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
|--------|------|------|--------|------|
| `notes` | Array[Object] | ❌ | `[]` | 메모 목록 |
| `notes[].content` | String | ✅ | - | 메모 내용 |
| `notes[].createdAt` | Date | ❌ | `Date.now` | 메모 작성일 |

### 자동 생성 필드

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `createdAt` | Date | 생성일시 (자동) |
| `updatedAt` | Date | 수정일시 (자동) |

## 🔍 가상 필드 (Virtual Fields)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `isOverdue` | Boolean | 마감일 초과 여부 |
| `daysUntilDue` | Number | 마감일까지 남은 일수 |
| `isDueSoon` | Boolean | 곧 마감인지 여부 (3일 이내) |
| `completionRate` | Number | 완료율 (0-100%) |

## 🛠️ 인스턴스 메서드

### `addNote(content)`
- 할일에 메모 추가
- **매개변수**: `content` (String) - 메모 내용
- **반환값**: Promise\<Todo\>

### `updateProgress(progress)`
- 진행률 업데이트
- **매개변수**: `progress` (Number) - 진행률 (0-100)
- **반환값**: Promise\<Todo\>

### `markComplete()`
- 할일을 완료 상태로 변경
- **반환값**: Promise\<Todo\>

## 🔧 정적 메서드

### `findByCategory(category)`
- 카테고리별 할일 조회
- **매개변수**: `category` (String) - 카테고리명
- **반환값**: Promise\<Array\<Todo\>\>

### `findOverdue()`
- 마감일 초과된 할일 조회
- **반환값**: Promise\<Array\<Todo\>\>

### `findDueSoon(days = 3)`
- 곧 마감인 할일 조회
- **매개변수**: `days` (Number) - 일수 (기본값: 3)
- **반환값**: Promise\<Array\<Todo\>\>

### `getStatistics()`
- 할일 통계 조회
- **반환값**: Promise\<Object\>
```javascript
{
  total: 10,      // 전체 할일 수
  completed: 5,   // 완료된 할일 수
  pending: 3,     // 대기 중인 할일 수
  inProgress: 2,  // 진행 중인 할일 수
  overdue: 1      // 마감일 초과된 할일 수
}
```

## 📈 인덱스 설정

| 인덱스 | 용도 |
|--------|------|
| `{ title: 'text', description: 'text' }` | 텍스트 검색 |
| `{ completed: 1, status: 1 }` | 완료/상태별 조회 |
| `{ priority: 1 }` | 우선순위별 조회 |
| `{ category: 1 }` | 카테고리별 조회 |
| `{ dueDate: 1 }` | 마감일별 조회 |
| `{ createdAt: -1 }` | 최신순 조회 |
| `{ tags: 1 }` | 태그별 조회 |
| `{ status: 1, priority: 1 }` | 복합 인덱스 |

## 💡 사용 예시

### 1. 기본 할일 생성
```javascript
const todo = new Todo({
  title: "프로젝트 완료하기",
  description: "React 프로젝트 마무리 작업",
  priority: "high",
  category: "업무",
  tags: ["프로젝트", "React"],
  dueDate: new Date("2024-12-31")
});
```

### 2. 진행률 업데이트
```javascript
await todo.updateProgress(50);
```

### 3. 메모 추가
```javascript
await todo.addNote("중요한 부분은 API 연동이다.");
```

### 4. 통계 조회
```javascript
const stats = await Todo.getStatistics();
console.log(`완료율: ${(stats.completed / stats.total * 100).toFixed(1)}%`);
```

### 5. 마감일 임박 할일 조회
```javascript
const urgentTodos = await Todo.findDueSoon(1); // 1일 이내 마감
```

## 🔄 자동 동작

1. **진행률 변경 시**: 진행률에 따라 상태가 자동으로 변경됩니다.
   - 0% → `pending`
   - 1-99% → `in_progress`
   - 100% → `completed`

2. **완료 시**: `completedAt` 필드가 자동으로 설정됩니다.

3. **저장 시**: `updatedAt` 필드가 자동으로 갱신됩니다.

## 🎯 검증 규칙

- **제목**: 필수, 최대 200자
- **설명**: 최대 1000자
- **우선순위**: low, medium, high, urgent 중 하나
- **상태**: pending, in_progress, completed, cancelled 중 하나
- **진행률**: 0-100 사이의 숫자
- **마감일**: 오늘 이후의 날짜만 허용
- **태그**: 각 태그는 최대 20자
- **카테고리**: 최대 50자
