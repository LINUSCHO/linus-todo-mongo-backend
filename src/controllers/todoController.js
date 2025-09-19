const Todo = require('../models/Todo');

// 모든 할 일 조회 (고급 필터링)
const getAllTodos = async (req, res) => {
  try {
    const { 
      completed, 
      priority, 
      category,
      status,
      search, 
      tags,
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      dueDate,
      progressMin,
      progressMax
    } = req.query;
    
    // 필터 객체 생성
    const filter = {};
    
    // 완료 상태 필터
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    
    // 우선순위 필터
    if (priority) {
      filter.priority = priority;
    }
    
    // 카테고리 필터
    if (category) {
      filter.category = category;
    }
    
    // 상태 필터
    if (status) {
      filter.status = status;
    }
    
    // 태그 필터
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }
    
    // 마감일 필터
    if (dueDate) {
      const date = new Date(dueDate);
      filter.dueDate = { $lte: date };
    }
    
    // 진행률 필터
    if (progressMin !== undefined || progressMax !== undefined) {
      filter.progress = {};
      if (progressMin !== undefined) filter.progress.$gte = parseInt(progressMin);
      if (progressMax !== undefined) filter.progress.$lte = parseInt(progressMax);
    }
    
    // 텍스트 검색
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // 정렬 설정
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 총 개수와 할일 조회
    const [totalCount, todos] = await Promise.all([
      Todo.countDocuments(filter),
      Todo.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
    ]);
    
    res.json({
      success: true,
      count: todos.length,
      totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '할 일 목록을 가져오는데 실패했습니다.',
      error: error.message
    });
  }
};

// 특정 할 일 조회
const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할 일을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '할 일을 가져오는데 실패했습니다.',
      error: error.message
    });
  }
};

// 새 할 일 생성
const createTodo = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      category,
      dueDate, 
      tags, 
      status,
      progress,
      repeat,
      notes
    } = req.body;

    // 제목 필수 검증
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '제목은 필수입니다.'
      });
    }

    // 우선순위 검증
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: '우선순위는 low, medium, high, urgent 중 하나여야 합니다.'
      });
    }

    // 상태 검증
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '상태는 pending, in_progress, completed, cancelled 중 하나여야 합니다.'
      });
    }

    // 진행률 검증
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({
        success: false,
        message: '진행률은 0-100 사이의 값이어야 합니다.'
      });
    }

    // 반복 설정 검증
    if (repeat && repeat.type) {
      const validRepeatTypes = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
      if (!validRepeatTypes.includes(repeat.type)) {
        return res.status(400).json({
          success: false,
          message: '반복 타입은 none, daily, weekly, monthly, yearly 중 하나여야 합니다.'
        });
      }
    }

    // 새 할일 객체 생성
    const todoData = {
      title: title.trim(),
      description: description?.trim() || '',
      priority: priority || 'medium',
      category: category?.trim() || '',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: Array.isArray(tags) ? tags.filter(tag => tag && tag.trim()) : [],
      status: status || 'pending',
      progress: progress || 0,
      repeat: repeat || { type: 'none', interval: 1 },
      notes: Array.isArray(notes) ? notes.filter(note => note && note.content && note.content.trim()) : []
    };

    // 진행률과 상태 일치성 검사
    if (todoData.progress === 100 && todoData.status !== 'completed') {
      todoData.status = 'completed';
      todoData.completed = true;
    } else if (todoData.progress > 0 && todoData.status === 'pending') {
      todoData.status = 'in_progress';
    }

    const todo = new Todo(todoData);
    const savedTodo = await todo.save();

    res.status(201).json({
      success: true,
      message: '할 일이 성공적으로 생성되었습니다.',
      data: savedTodo
    });
  } catch (error) {
    // Mongoose 검증 오류 처리
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: '입력 데이터 검증에 실패했습니다.',
        errors: errors
      });
    }

    res.status(400).json({
      success: false,
      message: '할 일 생성에 실패했습니다.',
      error: error.message
    });
  }
};

// 할 일 수정
const updateTodo = async (req, res) => {
  try {
    const { title, description, completed, priority, dueDate, tags } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (completed !== undefined) updateData.completed = completed;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) updateData.tags = tags;

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할 일을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '할 일이 성공적으로 수정되었습니다.',
      data: todo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '할 일 수정에 실패했습니다.',
      error: error.message
    });
  }
};

// 할 일 삭제
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할 일을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '할 일이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '할 일 삭제에 실패했습니다.',
      error: error.message
    });
  }
};

// 완료 상태 토글
const toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할 일을 찾을 수 없습니다.'
      });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json({
      success: true,
      message: `할 일이 ${todo.completed ? '완료' : '미완료'}로 변경되었습니다.`,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '할 일 상태 변경에 실패했습니다.',
      error: error.message
    });
  }
};

// 빠른 할일 생성 (제목만으로)
const createQuickTodo = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '제목은 필수입니다.'
      });
    }

    const todo = new Todo({
      title: title.trim(),
      priority: 'medium',
      status: 'pending',
      progress: 0
    });

    const savedTodo = await todo.save();

    res.status(201).json({
      success: true,
      message: '할 일이 빠르게 생성되었습니다.',
      data: savedTodo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '할 일 생성에 실패했습니다.',
      error: error.message
    });
  }
};

// 템플릿으로 할일 생성
const createTodoFromTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { customizations = {} } = req.body;

    // 기본 템플릿들
    const templates = {
      'work': {
        title: '업무 작업',
        priority: 'medium',
        category: '업무',
        tags: ['업무']
      },
      'personal': {
        title: '개인 일정',
        priority: 'low',
        category: '개인',
        tags: ['개인']
      },
      'urgent': {
        title: '긴급 작업',
        priority: 'urgent',
        category: '긴급',
        tags: ['긴급']
      },
      'study': {
        title: '학습',
        priority: 'medium',
        category: '학습',
        tags: ['학습']
      }
    };

    const template = templates[templateId];
    if (!template) {
      return res.status(400).json({
        success: false,
        message: '존재하지 않는 템플릿입니다.',
        availableTemplates: Object.keys(templates)
      });
    }

    // 템플릿과 사용자 커스터마이징 병합
    const todoData = {
      ...template,
      ...customizations,
      title: customizations.title || template.title,
      status: 'pending',
      progress: 0
    };

    const todo = new Todo(todoData);
    const savedTodo = await todo.save();

    res.status(201).json({
      success: true,
      message: `템플릿 "${templateId}"에서 할 일이 생성되었습니다.`,
      data: savedTodo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '템플릿에서 할 일 생성에 실패했습니다.',
      error: error.message
    });
  }
};

// 대량 할일 생성
const createBulkTodos = async (req, res) => {
  try {
    const { todos } = req.body;

    if (!Array.isArray(todos) || todos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'todos 배열이 필요합니다.'
      });
    }

    if (todos.length > 50) {
      return res.status(400).json({
        success: false,
        message: '한 번에 최대 50개의 할일만 생성할 수 있습니다.'
      });
    }

    const createdTodos = [];
    const errors = [];

    for (let i = 0; i < todos.length; i++) {
      try {
        const todoData = todos[i];
        
        if (!todoData.title || todoData.title.trim() === '') {
          errors.push({
            index: i,
            error: '제목은 필수입니다.'
          });
          continue;
        }

        const todo = new Todo({
          title: todoData.title.trim(),
          description: todoData.description?.trim() || '',
          priority: todoData.priority || 'medium',
          category: todoData.category?.trim() || '',
          dueDate: todoData.dueDate ? new Date(todoData.dueDate) : undefined,
          tags: Array.isArray(todoData.tags) ? todoData.tags.filter(tag => tag && tag.trim()) : [],
          status: todoData.status || 'pending',
          progress: todoData.progress || 0,
          repeat: todoData.repeat || { type: 'none', interval: 1 }
        });

        const savedTodo = await todo.save();
        createdTodos.push(savedTodo);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdTodos.length}개의 할일이 생성되었습니다.`,
      data: createdTodos,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: todos.length,
        created: createdTodos.length,
        failed: errors.length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '대량 할일 생성에 실패했습니다.',
      error: error.message
    });
  }
};

// 할일 복사
const duplicateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { modifications = {} } = req.body;

    const originalTodo = await Todo.findById(id);
    if (!originalTodo) {
      return res.status(404).json({
        success: false,
        message: '복사할 할일을 찾을 수 없습니다.'
      });
    }

    // 원본 할일의 데이터 복사 (수정사항 적용)
    const todoData = {
      title: modifications.title || `${originalTodo.title} (복사)`,
      description: modifications.description || originalTodo.description,
      priority: modifications.priority || originalTodo.priority,
      category: modifications.category || originalTodo.category,
      dueDate: modifications.dueDate ? new Date(modifications.dueDate) : undefined,
      tags: modifications.tags || originalTodo.tags,
      status: 'pending',
      progress: 0,
      repeat: modifications.repeat || originalTodo.repeat,
      notes: []
    };

    const newTodo = new Todo(todoData);
    const savedTodo = await newTodo.save();

    res.status(201).json({
      success: true,
      message: '할일이 성공적으로 복사되었습니다.',
      data: savedTodo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '할일 복사에 실패했습니다.',
      error: error.message
    });
  }
};

// 카테고리별 할일 조회
const getTodosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { sortBy = 'createdAt', sortOrder = 'desc', limit = 50 } = req.query;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const todos = await Todo.findByCategory(category)
      .sort(sort)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: todos.length,
      category,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '카테고리별 할일 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 우선순위별 할일 조회
const getTodosByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    const { sortBy = 'createdAt', sortOrder = 'desc', limit = 50 } = req.query;
    
    // 우선순위 검증
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 우선순위입니다.',
        validPriorities
      });
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const todos = await Todo.find({ priority })
      .sort(sort)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: todos.length,
      priority,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '우선순위별 할일 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 상태별 할일 조회
const getTodosByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { sortBy = 'createdAt', sortOrder = 'desc', limit = 50 } = req.query;
    
    // 상태 검증
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상태입니다.',
        validStatuses
      });
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const todos = await Todo.find({ status })
      .sort(sort)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: todos.length,
      status,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상태별 할일 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 마감일 초과된 할일 조회
const getOverdueTodos = async (req, res) => {
  try {
    const { sortBy = 'dueDate', sortOrder = 'asc', limit = 50 } = req.query;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const todos = await Todo.findOverdue()
      .sort(sort)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: todos.length,
      message: '마감일이 초과된 할일 목록입니다.',
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '마감일 초과 할일 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 곧 마감인 할일 조회
const getDueSoonTodos = async (req, res) => {
  try {
    const { days = 3, sortBy = 'dueDate', sortOrder = 'asc', limit = 50 } = req.query;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const todos = await Todo.findDueSoon(parseInt(days))
      .sort(sort)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: todos.length,
      message: `${days}일 이내에 마감인 할일 목록입니다.`,
      days: parseInt(days),
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '마감 임박 할일 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 태그별 할일 조회
const getTodosByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { sortBy = 'createdAt', sortOrder = 'desc', limit = 50 } = req.query;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const todos = await Todo.find({ tags: tag })
      .sort(sort)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: todos.length,
      tag,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '태그별 할일 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 할일 통계 조회
const getTodoStatistics = async (req, res) => {
  try {
    const stats = await Todo.getStatistics();
    
    // 추가 통계 계산
    const completionRate = stats.total > 0 ? 
      Math.round((stats.completed / stats.total) * 100) : 0;
    
    const overdueRate = stats.total > 0 ? 
      Math.round((stats.overdue / stats.total) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        ...stats,
        completionRate,
        overdueRate,
        active: stats.pending + stats.inProgress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '통계 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 오늘의 할일 조회
const getTodayTodos = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { status, priority, sortBy = 'priority', sortOrder = 'desc' } = req.query;
    
    const filter = {
      dueDate: {
        $gte: today,
        $lt: tomorrow
      }
    };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const todos = await Todo.find(filter).sort(sort);
    
    res.json({
      success: true,
      count: todos.length,
      message: '오늘 마감인 할일 목록입니다.',
      date: today.toISOString().split('T')[0],
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '오늘의 할일 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 이번 주 할일 조회
const getThisWeekTodos = async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // 일요일
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 토요일
    endOfWeek.setHours(23, 59, 59, 999);
    
    const { status, priority, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;
    
    const filter = {
      dueDate: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const todos = await Todo.find(filter).sort(sort);
    
    res.json({
      success: true,
      count: todos.length,
      message: '이번 주 할일 목록입니다.',
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0],
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '이번 주 할일 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 검색 기능 강화
const searchTodos = async (req, res) => {
  try {
    const { q, type = 'all', limit = 20 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '검색어를 입력해주세요.'
      });
    }
    
    let filter = {};
    const searchRegex = { $regex: q, $options: 'i' };
    
    switch (type) {
      case 'title':
        filter.title = searchRegex;
        break;
      case 'description':
        filter.description = searchRegex;
        break;
      case 'category':
        filter.category = searchRegex;
        break;
      case 'tags':
        filter.tags = searchRegex;
        break;
      case 'all':
      default:
        filter.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { tags: searchRegex }
        ];
        break;
    }
    
    const todos = await Todo.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: todos.length,
      query: q,
      type,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '검색에 실패했습니다.',
      error: error.message
    });
  }
};

module.exports = {
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
};
