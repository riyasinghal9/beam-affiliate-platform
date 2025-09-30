const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const UserProgress = require('../models/UserProgress');

// Get all courses with user progress
const getCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all courses
    const courses = await Course.find({ isActive: true })
      .populate('lessons')
      .sort({ sortOrder: 1, createdAt: -1 });

    // Get user progress
    const userProgress = await UserProgress.findOne({ userId });

    // Combine courses with progress
    const coursesWithProgress = courses.map(course => {
      const courseProgress = userProgress?.courses?.find(cp => cp.courseId.toString() === course._id.toString());
      const completedLessons = courseProgress?.completedLessons || [];
      const progress = course.lessons.length > 0 ? (completedLessons.length / course.lessons.length) * 100 : 0;
      const isCompleted = progress === 100;

      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.lessons.reduce((total, lesson) => total + lesson.duration, 0),
        lessons: course.lessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          type: lesson.type,
          duration: lesson.duration,
          isCompleted: completedLessons.includes(lesson._id.toString())
        })),
        progress,
        isCompleted,
        isLocked: course.requiredLevel && user.level !== course.requiredLevel,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        rating: course.rating,
        enrolledCount: course.enrolledCount
      };
    });

    res.json({
      success: true,
      courses: coursesWithProgress
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
};

// Get course details with lesson content
const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId)
      .populate('lessons');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get user progress for this course
    const userProgress = await UserProgress.findOne({ userId });
    const courseProgress = userProgress?.courses?.find(cp => cp.courseId.toString() === courseId);
    const completedLessons = courseProgress?.completedLessons || [];

    // Add completion status to lessons
    const lessonsWithProgress = course.lessons.map(lesson => ({
      _id: lesson._id,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      quiz: lesson.quiz,
      isCompleted: completedLessons.includes(lesson._id.toString())
    }));

    const progress = course.lessons.length > 0 ? (completedLessons.length / course.lessons.length) * 100 : 0;

    res.json({
      success: true,
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        lessons: lessonsWithProgress,
        progress,
        isCompleted: progress === 100,
        instructor: course.instructor,
        rating: course.rating
      }
    });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course details'
    });
  }
};

// Mark lesson as complete
const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const userId = req.user._id;

    // Validate course and lesson exist
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Update or create user progress
    let userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      userProgress = new UserProgress({
        userId,
        courses: []
      });
    }

    // Find or create course progress
    let courseProgress = userProgress.courses.find(cp => cp.courseId.toString() === courseId);
    
    if (!courseProgress) {
      courseProgress = {
        courseId,
        completedLessons: [],
        startedAt: new Date(),
        lastAccessedAt: new Date()
      };
      userProgress.courses.push(courseProgress);
    }

    // Add lesson to completed lessons if not already completed
    if (!courseProgress.completedLessons.includes(lessonId)) {
      courseProgress.completedLessons.push(lessonId);
    }

    courseProgress.lastAccessedAt = new Date();
    courseProgress.completedAt = courseProgress.completedLessons.length === course.lessons.length ? new Date() : null;

    await userProgress.save();

    // Calculate updated progress
    const progress = course.lessons.length > 0 ? (courseProgress.completedLessons.length / course.lessons.length) * 100 : 0;
    const isCompleted = progress === 100;

    // Award points or achievements if course is completed
    if (isCompleted && !courseProgress.completedAt) {
      await awardCourseCompletion(userId, course);
    }

    res.json({
      success: true,
      message: 'Lesson marked as complete',
      progress,
      isCompleted
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing lesson'
    });
  }
};

// Get user training progress
const getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const userProgress = await UserProgress.findOne({ userId })
      .populate('courses.courseId');

    if (!userProgress) {
      return res.json({
        success: true,
        progress: {
          totalCourses: 0,
          completedCourses: 0,
          totalLessons: 0,
          completedLessons: 0,
          overallProgress: 0,
          certificates: [],
          achievements: []
        }
      });
    }

    // Calculate overall progress
    const totalCourses = userProgress.courses.length;
    const completedCourses = userProgress.courses.filter(cp => cp.completedAt).length;
    const totalLessons = userProgress.courses.reduce((total, cp) => total + (cp.courseId?.lessons?.length || 0), 0);
    const completedLessons = userProgress.courses.reduce((total, cp) => total + cp.completedLessons.length, 0);
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    res.json({
      success: true,
      progress: {
        totalCourses,
        completedCourses,
        totalLessons,
        completedLessons,
        overallProgress,
        certificates: userProgress.certificates || [],
        achievements: userProgress.achievements || [],
        recentActivity: userProgress.courses
          .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
          .slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user progress'
    });
  }
};

// Get training statistics
const getTrainingStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [userProgress, totalCourses, totalLessons] = await Promise.all([
      UserProgress.findOne({ userId }),
      Course.countDocuments({ isActive: true }),
      Lesson.countDocuments()
    ]);

    const stats = {
      totalCourses,
      totalLessons,
      enrolledCourses: userProgress?.courses?.length || 0,
      completedCourses: userProgress?.courses?.filter(cp => cp.completedAt)?.length || 0,
      completedLessons: userProgress?.courses?.reduce((total, cp) => total + cp.completedLessons.length, 0) || 0,
      totalStudyTime: userProgress?.totalStudyTime || 0,
      certificates: userProgress?.certificates?.length || 0,
      achievements: userProgress?.achievements?.length || 0
    };

    // Calculate progress percentages
    stats.courseProgress = totalCourses > 0 ? (stats.enrolledCourses / totalCourses) * 100 : 0;
    stats.lessonProgress = totalLessons > 0 ? (stats.completedLessons / totalLessons) * 100 : 0;

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get training stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching training statistics'
    });
  }
};

// Award course completion
const awardCourseCompletion = async (userId, course) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Award points
    const points = course.points || 100;
    user.points = (user.points || 0) + points;

    // Check for level progression
    const newLevel = calculateNewLevel(user.points);
    if (newLevel !== user.level) {
      user.level = newLevel;
    }

    await user.save();

    // Add certificate
    const certificate = {
      courseId: course._id,
      courseName: course.title,
      issuedAt: new Date(),
      certificateId: generateCertificateId()
    };

    await UserProgress.findOneAndUpdate(
      { userId },
      { $push: { certificates: certificate } },
      { upsert: true }
    );

    // Add achievement
    const achievement = {
      type: 'course_completion',
      title: `Completed ${course.title}`,
      description: `Successfully completed the ${course.title} course`,
      earnedAt: new Date(),
      points: points
    };

    await UserProgress.findOneAndUpdate(
      { userId },
      { $push: { achievements: achievement } },
      { upsert: true }
    );

  } catch (error) {
    console.error('Award course completion error:', error);
  }
};

// Calculate new level based on points
const calculateNewLevel = (points) => {
  if (points >= 1000) return 'Ambassador';
  if (points >= 500) return 'Active';
  return 'Beginner';
};

// Generate certificate ID
const generateCertificateId = () => {
  return 'CERT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Get certificates
const getCertificates = async (req, res) => {
  try {
    const userId = req.user._id;

    const userProgress = await UserProgress.findOne({ userId })
      .populate('certificates.courseId');

    const certificates = userProgress?.certificates || [];

    res.json({
      success: true,
      certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching certificates'
    });
  }
};

// Get achievements
const getAchievements = async (req, res) => {
  try {
    const userId = req.user._id;

    const userProgress = await UserProgress.findOne({ userId });

    const achievements = userProgress?.achievements || [];

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements'
    });
  }
};

// Admin: Create course
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      instructor,
      lessons,
      thumbnail,
      requiredLevel,
      points
    } = req.body;

    const course = new Course({
      title,
      description,
      category,
      level,
      instructor,
      lessons,
      thumbnail,
      requiredLevel,
      points,
      isActive: true
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    });
  }
};

// Admin: Update course
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;

    const course = await Course.findByIdAndUpdate(
      courseId,
      updates,
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
};

// Admin: Delete course
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByIdAndDelete(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course'
    });
  }
};

module.exports = {
  getCourses,
  getCourseDetails,
  completeLesson,
  getUserProgress,
  getTrainingStats,
  getCertificates,
  getAchievements,
  createCourse,
  updateCourse,
  deleteCourse
}; 