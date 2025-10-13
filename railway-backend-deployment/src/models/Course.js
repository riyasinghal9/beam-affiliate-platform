const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['affiliate-marketing', 'social-media', 'content-creation', 'analytics', 'advanced-strategies']
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  instructor: {
    type: String,
    required: true
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  thumbnail: {
    type: String,
    default: null
  },
  requiredLevel: {
    type: String,
    enum: {
      values: ['Beginner', 'Active', 'Ambassador', null],
      message: 'Required level must be Beginner, Active, Ambassador, or null'
    },
    default: null
  },
  points: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  estimatedDuration: {
    type: Number, // in minutes
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  language: {
    type: String,
    default: 'en'
  },
  certificate: {
    enabled: {
      type: Boolean,
      default: true
    },
    template: {
      type: String,
      default: 'default'
    }
  },
  metadata: {
    seoTitle: String,
    seoDescription: String,
    keywords: [String],
    featured: {
      type: Boolean,
      default: false
    },
    featuredOrder: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ isActive: 1, sortOrder: 1 });
courseSchema.index({ requiredLevel: 1 });
courseSchema.index({ 'metadata.featured': 1, 'metadata.featuredOrder': 1 });
courseSchema.index({ tags: 1 });

// Virtual for total duration
courseSchema.virtual('totalDuration').get(function() {
  return this.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
});

// Virtual for lesson count
courseSchema.virtual('lessonCount').get(function() {
  return this.lessons.length;
});

// Pre-save middleware to update estimated duration
courseSchema.pre('save', async function(next) {
  if (this.lessons && this.lessons.length > 0) {
    const Lesson = mongoose.model('Lesson');
    const lessonDurations = await Lesson.find({ _id: { $in: this.lessons } }).select('duration');
    this.estimatedDuration = lessonDurations.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }
  next();
});

// Instance methods
courseSchema.methods.getProgress = async function(userId) {
  const UserProgress = mongoose.model('UserProgress');
  const userProgress = await UserProgress.findOne({ userId });
  
  if (!userProgress) return 0;
  
  const courseProgress = userProgress.courses.find(cp => cp.courseId.toString() === this._id.toString());
  if (!courseProgress) return 0;
  
  return this.lessons.length > 0 ? (courseProgress.completedLessons.length / this.lessons.length) * 100 : 0;
};

courseSchema.methods.isCompleted = async function(userId) {
  const progress = await this.getProgress(userId);
  return progress === 100;
};

courseSchema.methods.isAccessible = function(userLevel) {
  if (!this.requiredLevel) return true;
  return userLevel === this.requiredLevel;
};

// Static methods
courseSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ sortOrder: 1 });
};

courseSchema.statics.getByLevel = function(level) {
  return this.find({ level, isActive: true }).sort({ sortOrder: 1 });
};

courseSchema.statics.getFeatured = function() {
  return this.find({ 
    isActive: true, 
    'metadata.featured': true 
  }).sort({ 'metadata.featuredOrder': 1 });
};

courseSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  }).sort({ sortOrder: 1 });
};

module.exports = mongoose.model('Course', courseSchema); 