const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  // 할일 제목 (필수)
  title: {
    type: String,
    required: [true, '제목은 필수입니다.'],
    trim: true,
    maxlength: [200, '제목은 200자를 초과할 수 없습니다.']
  },
  
  // 할일 설명 (선택)
  description: {
    type: String,
    trim: true,
    maxlength: [1000, '설명은 1000자를 초과할 수 없습니다.']
  },
  
  // 완료 상태
  completed: {
    type: Boolean,
    default: false
  },
  
  // 우선순위
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: '우선순위는 low, medium, high, urgent 중 하나여야 합니다.'
    },
    default: 'medium'
  },
  
  // 카테고리
  category: {
    type: String,
    trim: true,
    maxlength: [50, '카테고리는 50자를 초과할 수 없습니다.']
  },
  
  // 마감일
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= new Date().setHours(0, 0, 0, 0);
      },
      message: '마감일은 오늘 이후여야 합니다.'
    }
  },
  
  // 태그
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, '태그는 20자를 초과할 수 없습니다.']
  }],
  
  // 완료된 날짜
  completedAt: {
    type: Date
  },
  
  // 할일 상태 (추가된 상태 관리)
  status: {
    type: String,
    enum: {
      values: ['pending', 'in_progress', 'completed', 'cancelled'],
      message: '상태는 pending, in_progress, completed, cancelled 중 하나여야 합니다.'
    },
    default: 'pending'
  },
  
  // 진행률 (0-100%)
  progress: {
    type: Number,
    min: [0, '진행률은 0 이상이어야 합니다.'],
    max: [100, '진행률은 100 이하여야 합니다.'],
    default: 0
  },
  
  // 반복 설정
  repeat: {
    type: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'none'
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    endDate: Date
  },
  
  // 메모/노트
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 생성일시 (자동)
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // 수정일시 (자동)
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 인덱스 설정 (검색 성능 최적화)
todoSchema.index({ title: 'text', description: 'text' }); // 텍스트 검색
todoSchema.index({ completed: 1, status: 1 }); // 완료/상태별 조회
todoSchema.index({ priority: 1 }); // 우선순위별 조회
todoSchema.index({ category: 1 }); // 카테고리별 조회
todoSchema.index({ dueDate: 1 }); // 마감일별 조회
todoSchema.index({ createdAt: -1 }); // 최신순 조회
todoSchema.index({ tags: 1 }); // 태그별 조회
todoSchema.index({ status: 1, priority: 1 }); // 복합 인덱스

// 미들웨어 - 저장 전 처리
todoSchema.pre('save', function(next) {
  // 완료 상태가 변경될 때 완료일시 업데이트
  if (this.isModified('completed') || this.isModified('status')) {
    if (this.completed || this.status === 'completed') {
      this.completedAt = new Date();
    } else {
      this.completedAt = undefined;
    }
  }
  
  // 진행률에 따른 상태 자동 업데이트
  if (this.isModified('progress')) {
    if (this.progress === 100 && this.status !== 'completed') {
      this.status = 'completed';
      this.completed = true;
      this.completedAt = new Date();
    } else if (this.progress > 0 && this.status === 'pending') {
      this.status = 'in_progress';
    } else if (this.progress === 0 && this.status === 'in_progress') {
      this.status = 'pending';
    }
  }
  
  // updatedAt 자동 갱신
  this.updatedAt = new Date();
  next();
});

// 가상 필드들
todoSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && !this.completed;
});

todoSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

todoSchema.virtual('isDueSoon').get(function() {
  return this.daysUntilDue !== null && this.daysUntilDue <= 3 && this.daysUntilDue >= 0;
});

todoSchema.virtual('completionRate').get(function() {
  if (this.completed) return 100;
  return this.progress || 0;
});

// 인스턴스 메서드들
todoSchema.methods.addNote = function(content) {
  this.notes.push({ content });
  return this.save();
};

todoSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress));
  return this.save();
};

todoSchema.methods.markComplete = function() {
  this.completed = true;
  this.status = 'completed';
  this.progress = 100;
  this.completedAt = new Date();
  return this.save();
};

// 정적 메서드들
todoSchema.statics.findByCategory = function(category) {
  return this.find({ category });
};

todoSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    completed: false
  });
};

todoSchema.statics.findDueSoon = function(days = 3) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    dueDate: { $lte: futureDate, $gte: new Date() },
    completed: false
  });
};

todoSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: ['$completed', 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$completed', true] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0
  };
};

module.exports = mongoose.model('Todo', todoSchema);
