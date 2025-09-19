const express = require('express');
const {
  getAllTodos,
  getTodoById,
  getTodosByCategory,
  getTodosByPriority,
  getTodosByStatus,
  getOverdueTodos,
  getDueSoonTodos,
  getTodosByTag,
  getTodoStatistics,
  getTodayTodos,
  getThisWeekTodos,
  searchTodos,
  createTodo,
  createQuickTodo,
  createTodoFromTemplate,
  createBulkTodos,
  duplicateTodo,
  updateTodo,
  deleteTodo,
  toggleTodo
} = require('../controllers/todoController');

const router = express.Router();

// ==================== 조회 라우트 ====================

// GET /api/todos - 모든 할 일 조회 (고급 필터링, 페이지네이션)
router.get('/', getAllTodos);

// GET /api/todos/statistics - 할 일 통계 조회
router.get('/statistics', getTodoStatistics);

// GET /api/todos/search - 할 일 검색
router.get('/search', searchTodos);

// GET /api/todos/today - 오늘의 할 일 조회
router.get('/today', getTodayTodos);

// GET /api/todos/week - 이번 주 할 일 조회
router.get('/week', getThisWeekTodos);

// GET /api/todos/overdue - 마감일 초과된 할 일 조회
router.get('/overdue', getOverdueTodos);

// GET /api/todos/due-soon - 곧 마감인 할 일 조회
router.get('/due-soon', getDueSoonTodos);

// GET /api/todos/category/:category - 카테고리별 할 일 조회
router.get('/category/:category', getTodosByCategory);

// GET /api/todos/priority/:priority - 우선순위별 할 일 조회
router.get('/priority/:priority', getTodosByPriority);

// GET /api/todos/status/:status - 상태별 할 일 조회
router.get('/status/:status', getTodosByStatus);

// GET /api/todos/tag/:tag - 태그별 할 일 조회
router.get('/tag/:tag', getTodosByTag);

// GET /api/todos/:id - 특정 할 일 조회
router.get('/:id', getTodoById);

// ==================== 생성 라우트 ====================

// POST /api/todos - 새 할 일 생성 (완전한 형태)
router.post('/', createTodo);

// POST /api/todos/quick - 빠른 할 일 생성 (제목만으로)
router.post('/quick', createQuickTodo);

// POST /api/todos/template/:templateId - 템플릿으로 할 일 생성
router.post('/template/:templateId', createTodoFromTemplate);

// POST /api/todos/bulk - 대량 할 일 생성
router.post('/bulk', createBulkTodos);

// POST /api/todos/:id/duplicate - 할 일 복사
router.post('/:id/duplicate', duplicateTodo);

// ==================== 수정/삭제 라우트 ====================

// PUT /api/todos/:id - 할 일 수정
router.put('/:id', updateTodo);

// PATCH /api/todos/:id/toggle - 완료 상태 토글
router.patch('/:id/toggle', toggleTodo);

// DELETE /api/todos/:id - 할 일 삭제
router.delete('/:id', deleteTodo);

module.exports = router;
