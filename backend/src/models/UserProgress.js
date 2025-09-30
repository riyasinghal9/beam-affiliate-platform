const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  totalStudyTime: {
    type: Number, // in minutes
    default: 0
  },
  quizScores: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    score: Number,
    maxScore: Number,
    percentage: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    timestamp: Number, // video timestamp in seconds
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const certificateSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  grade: {
    type: String,
    enum: ['pass', 'merit', 'distinction'],
    default: 'pass'
  },
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 100
  },
  downloadUrl: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: true
  }
});

const achievementSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'course_completion',
      'lesson_completion',
      'quiz_perfect_score',
      'study_streak',
      'first_course',
      'speed_learner',
      'perfect_attendance',
      'helpful_contributor',
      'social_learner',
      'certificate_earner'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  points: {
    type: Number,
    default: 0
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    courseId: mongoose.Schema.Types.ObjectId,
    lessonId: mongoose.Schema.Types.ObjectId,
    streakDays: Number,
    score: Number,
    maxScore: Number
  }
});

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  courses: [courseProgressSchema],
  totalStudyTime: {
    type: Number, // in minutes
    default: 0
  },
  totalLessonsCompleted: {
    type: Number,
    default: 0
  },
  totalCoursesCompleted: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastStudyDate: {
    type: Date,
    default: null
  },
  certificates: [certificateSchema],
  achievements: [achievementSchema],
  preferences: {
    autoPlay: {
      type: Boolean,
      default: true
    },
    playbackSpeed: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0
    },
    subtitles: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    emailUpdates: {
      type: Boolean,
      default: true
    }
  },
  statistics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalQuizAttempts: {
      type: Number,
      default: 0
    },
    averageQuizScore: {
      type: Number,
      default: 0
    },
    favoriteCategories: [{
      category: String,
      count: Number
    }],
    studyPatterns: [{
      dayOfWeek: Number,
      hourOfDay: Number,
      studyTime: Number
    }]
  },
  goals: {
    dailyStudyTime: {
      type: Number, // in minutes
      default: 30
    },
    weeklyCourses: {
      type: Number,
      default: 1
    },
    monthlyCertificates: {
      type: Number,
      default: 2
    }
  },
  notes: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    tags: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
userProgressSchema.index({ userId: 1 });
userProgressSchema.index({ 'courses.courseId': 1 });
userProgressSchema.index({ 'certificates.certificateId': 1 });
userProgressSchema.index({ 'achievements.type': 1 });
userProgressSchema.index({ lastStudyDate: -1 });

// Virtual for overall progress
userProgressSchema.virtual('overallProgress').get(function() {
  if (this.courses.length === 0) return 0;
  
  const totalProgress = this.courses.reduce((sum, course) => {
    const courseProgress = course.completedLessons.length / (course.courseId?.lessons?.length || 1);
    return sum + courseProgress;
  }, 0);
  
  return (totalProgress / this.courses.length) * 100;
});

// Virtual for formatted study time
userProgressSchema.virtual('formattedTotalStudyTime').get(function() {
  const hours = Math.floor(this.totalStudyTime / 60);
  const minutes = this.totalStudyTime % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Pre-save middleware to update statistics
userProgressSchema.pre('save', function(next) {
  // Update total lessons completed
  this.totalLessonsCompleted = this.courses.reduce((total, course) => 
    total + course.completedLessons.length, 0
  );
  
  // Update total courses completed
  this.totalCoursesCompleted = this.courses.filter(course => course.completedAt).length;
  
  // Update total study time
  this.totalStudyTime = this.courses.reduce((total, course) => 
    total + course.totalStudyTime, 0
  );
  
  next();
});

// Instance methods
userProgressSchema.methods.getCourseProgress = function(courseId) {
  const course = this.courses.find(cp => cp.courseId.toString() === courseId.toString());
  if (!course) return null;
  
  return {
    courseId: course.courseId,
    completedLessons: course.completedLessons,
    progress: course.completedLessons.length,
    startedAt: course.startedAt,
    lastAccessedAt: course.lastAccessedAt,
    completedAt: course.completedAt,
    totalStudyTime: course.totalStudyTime
  };
};

userProgressSchema.methods.markLessonComplete = function(courseId, lessonId) {
  let course = this.courses.find(cp => cp.courseId.toString() === courseId.toString());
  
  if (!course) {
    course = {
      courseId,
      completedLessons: [],
      startedAt: new Date(),
      lastAccessedAt: new Date(),
      totalStudyTime: 0
    };
    this.courses.push(course);
  }
  
  if (!course.completedLessons.includes(lessonId)) {
    course.completedLessons.push(lessonId);
  }
  
  course.lastAccessedAt = new Date();
  
  return course;
};

userProgressSchema.methods.addStudyTime = function(courseId, minutes) {
  const course = this.courses.find(cp => cp.courseId.toString() === courseId.toString());
  if (course) {
    course.totalStudyTime += minutes;
    course.lastAccessedAt = new Date();
  }
  
  this.totalStudyTime += minutes;
  this.lastStudyDate = new Date();
};

userProgressSchema.methods.updateStreak = function() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (this.lastStudyDate) {
    const lastStudy = new Date(this.lastStudyDate);
    const daysDiff = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Already studied today
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      this.currentStreak += 1;
    } else {
      // Streak broken
      this.currentStreak = 1;
    }
  } else {
    // First study session
    this.currentStreak = 1;
  }
  
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  this.lastStudyDate = today;
};

userProgressSchema.methods.addAchievement = function(achievement) {
  // Check if achievement already exists
  const exists = this.achievements.some(a => 
    a.type === achievement.type && 
    a.metadata?.courseId?.toString() === achievement.metadata?.courseId?.toString()
  );
  
  if (!exists) {
    this.achievements.push(achievement);
    return true;
  }
  
  return false;
};

userProgressSchema.methods.addCertificate = function(certificate) {
  this.certificates.push(certificate);
};

userProgressSchema.methods.getRecentActivity = function(limit = 10) {
  const activities = [];
  
  // Add course completions
  this.courses.forEach(course => {
    if (course.completedAt) {
      activities.push({
        type: 'course_completion',
        courseId: course.courseId,
        timestamp: course.completedAt,
        data: { courseName: course.courseId?.title }
      });
    }
  });
  
  // Add lesson completions
  this.courses.forEach(course => {
    course.completedLessons.forEach(lessonId => {
      activities.push({
        type: 'lesson_completion',
        courseId: course.courseId,
        lessonId,
        timestamp: course.lastAccessedAt,
        data: { lessonName: lessonId?.title }
      });
    });
  });
  
  // Add achievements
  this.achievements.forEach(achievement => {
    activities.push({
      type: 'achievement_earned',
      timestamp: achievement.earnedAt,
      data: { 
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon
      }
    });
  });
  
  // Sort by timestamp and return recent activities
  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

// Static methods
userProgressSchema.statics.getTopLearners = function(limit = 10) {
  return this.find()
    .sort({ totalStudyTime: -1, totalCoursesCompleted: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email');
};

userProgressSchema.statics.getStudyStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        avgStudyTime: { $avg: '$totalStudyTime' },
        avgCoursesCompleted: { $avg: '$totalCoursesCompleted' },
        avgLessonsCompleted: { $avg: '$totalLessonsCompleted' },
        totalCertificates: { $sum: { $size: '$certificates' } },
        totalAchievements: { $sum: { $size: '$achievements' } }
      }
    }
  ]);
};

module.exports = mongoose.model('UserProgress', userProgressSchema); 