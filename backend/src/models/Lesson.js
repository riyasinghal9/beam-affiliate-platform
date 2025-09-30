const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 10
  }
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    required: true,
    enum: ['video', 'text', 'quiz', 'interactive']
  },
  content: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  videoUrl: {
    type: String,
    default: null
  },
  videoDuration: {
    type: Number, // in seconds
    default: 0
  },
  thumbnail: {
    type: String,
    default: null
  },
  quiz: [quizQuestionSchema],
  resources: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'ppt', 'link', 'download'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    }
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFree: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 10
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    seoTitle: String,
    seoDescription: String,
    keywords: [String],
    transcript: String,
    subtitles: [{
      language: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }],
    notes: String,
    objectives: [String],
    prerequisites: [String]
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    avgCompletionTime: {
      type: Number,
      default: 0
    },
    avgScore: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
lessonSchema.index({ type: 1, isActive: 1 });
lessonSchema.index({ sortOrder: 1 });
lessonSchema.index({ tags: 1 });
lessonSchema.index({ 'metadata.keywords': 1 });

// Virtual for formatted duration
lessonSchema.virtual('formattedDuration').get(function() {
  const minutes = this.duration;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
});

// Virtual for formatted video duration
lessonSchema.virtual('formattedVideoDuration').get(function() {
  const seconds = this.videoDuration;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
});

// Virtual for quiz score
lessonSchema.virtual('maxQuizScore').get(function() {
  if (!this.quiz || this.quiz.length === 0) return 0;
  return this.quiz.reduce((total, question) => total + question.points, 0);
});

// Pre-save middleware to update duration
lessonSchema.pre('save', function(next) {
  // If it's a video lesson and we have video duration, update lesson duration
  if (this.type === 'video' && this.videoDuration > 0 && this.duration === 0) {
    this.duration = Math.ceil(this.videoDuration / 60); // Convert seconds to minutes
  }
  
  // If it's a quiz lesson, estimate duration based on number of questions
  if (this.type === 'quiz' && this.quiz && this.quiz.length > 0) {
    this.duration = Math.max(5, this.quiz.length * 2); // At least 5 minutes, 2 minutes per question
  }
  
  next();
});

// Instance methods
lessonSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  await this.save();
};

lessonSchema.methods.recordCompletion = async function(completionTime, score = null) {
  this.analytics.completions += 1;
  
  // Update average completion time
  const totalTime = this.analytics.avgCompletionTime * (this.analytics.completions - 1) + completionTime;
  this.analytics.avgCompletionTime = totalTime / this.analytics.completions;
  
  // Update average score if provided
  if (score !== null) {
    const totalScore = this.analytics.avgScore * (this.analytics.completions - 1) + score;
    this.analytics.avgScore = totalScore / this.analytics.completions;
  }
  
  await this.save();
};

lessonSchema.methods.getQuizResults = function(userAnswers) {
  if (!this.quiz || this.quiz.length === 0) {
    return {
      score: 0,
      maxScore: 0,
      percentage: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      results: []
    };
  }

  let score = 0;
  const results = [];

  this.quiz.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
      score += question.points;
    }
    
    results.push({
      questionIndex: index,
      question: question.question,
      userAnswer: userAnswer !== undefined ? question.options[userAnswer] : null,
      correctAnswer: question.options[question.correctAnswer],
      isCorrect,
      explanation: question.explanation,
      points: isCorrect ? question.points : 0
    });
  });

  const maxScore = this.maxQuizScore;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const correctAnswers = results.filter(r => r.isCorrect).length;

  return {
    score,
    maxScore,
    percentage,
    correctAnswers,
    totalQuestions: this.quiz.length,
    results
  };
};

lessonSchema.methods.isAccessible = function(userLevel, courseRequiredLevel) {
  // If lesson is free, it's always accessible
  if (this.isFree) return true;
  
  // If course has a required level, check against user level
  if (courseRequiredLevel) {
    return userLevel === courseRequiredLevel;
  }
  
  return true;
};

// Static methods
lessonSchema.statics.getByType = function(type) {
  return this.find({ type, isActive: true }).sort({ sortOrder: 1 });
};

lessonSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'analytics.views': -1, 'analytics.completions': -1 })
    .limit(limit);
};

lessonSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  }).sort({ sortOrder: 1 });
};

lessonSchema.statics.getByDifficulty = function(difficulty) {
  return this.find({ difficulty, isActive: true }).sort({ sortOrder: 1 });
};

module.exports = mongoose.model('Lesson', lessonSchema); 