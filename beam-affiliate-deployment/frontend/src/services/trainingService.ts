// Remove the problematic import and use localStorage directly
// import { getAuthToken } from '../utils/auth';

export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  lessons: Lesson[];
  progress: number;
  isCompleted: boolean;
  isLocked: boolean;
  thumbnail: string;
  instructor: string;
  rating: number;
  enrolledCount: number;
  requiredLevel?: string; // Add missing property
}

export interface Lesson {
  _id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: number;
  isCompleted: boolean;
  content: string;
  videoUrl?: string;
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface UserProgress {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
  certificates: Certificate[];
  achievements: Achievement[];
  recentActivity: any[];
}

export interface Certificate {
  courseId: string;
  courseName: string;
  certificateId: string;
  issuedAt: string;
  grade: string;
  score: number;
  maxScore: number;
}

export interface Achievement {
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  earnedAt: string;
}

export interface StudySession {
  courseId: string;
  lessonId: string;
  duration: number;
  action: 'start' | 'pause' | 'complete';
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  courseId?: string;
  lessonId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  _id: string;
  lessonId: string;
  timestamp: number;
  note: string;
  createdAt: string;
}

export interface UserPreferences {
  autoPlay: boolean;
  playbackSpeed: number;
  subtitles: boolean;
  language: string;
  notifications: boolean;
  emailUpdates: boolean;
}

class TrainingService {
  private baseUrl = '/api/training';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token'); // Use localStorage directly
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Training service error: ${response.statusText}`);
    }

    return response.json();
  }

  // Get all courses with user progress
  async getCourses(): Promise<{ success: boolean; courses: Course[] }> {
    return this.request<{ success: boolean; courses: Course[] }>('/courses');
  }

  // Get course details
  async getCourseDetails(courseId: string): Promise<{ success: boolean; course: Course }> {
    return this.request<{ success: boolean; course: Course }>(`/courses/${courseId}`);
  }

  // Mark lesson as complete
  async completeLesson(courseId: string, lessonId: string): Promise<{ success: boolean; progress: number; isCompleted: boolean }> {
    return this.request<{ success: boolean; progress: number; isCompleted: boolean }>('/complete-lesson', {
      method: 'POST',
      body: JSON.stringify({ courseId, lessonId }),
    });
  }

  // Get user progress
  async getUserProgress(): Promise<{ success: boolean; progress: UserProgress }> {
    return this.request<{ success: boolean; progress: UserProgress }>('/progress');
  }

  // Get training statistics
  async getTrainingStats(): Promise<{ success: boolean; stats: any }> {
    return this.request<{ success: boolean; stats: any }>('/stats');
  }

  // Get certificates
  async getCertificates(): Promise<{ success: boolean; certificates: Certificate[] }> {
    return this.request<{ success: boolean; certificates: Certificate[] }>('/certificates');
  }

  // Get achievements
  async getAchievements(): Promise<{ success: boolean; achievements: Achievement[] }> {
    return this.request<{ success: boolean; achievements: Achievement[] }>('/achievements');
  }

  // Record study session
  async recordStudySession(session: StudySession): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/study-session', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  // Submit quiz
  async submitQuiz(courseId: string, lessonId: string, answers: number[]): Promise<{
    success: boolean;
    results: {
      score: number;
      maxScore: number;
      percentage: number;
      correctAnswers: number;
      totalQuestions: number;
      results: any[];
    };
    message: string;
  }> {
    return this.request('/quiz-submit', {
      method: 'POST',
      body: JSON.stringify({ courseId, lessonId, answers }),
    });
  }

  // Add note
  async addNote(note: Omit<Note, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; note: Note }> {
    return this.request<{ success: boolean; message: string; note: Note }>('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  // Get notes
  async getNotes(courseId?: string, lessonId?: string): Promise<{ success: boolean; notes: Note[] }> {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (lessonId) params.append('lessonId', lessonId);

    return this.request<{ success: boolean; notes: Note[] }>(`/notes?${params.toString()}`);
  }

  // Update note
  async updateNote(noteId: string, updates: Partial<Note>): Promise<{ success: boolean; message: string; note: Note }> {
    return this.request<{ success: boolean; message: string; note: Note }>(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Delete note
  async deleteNote(noteId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // Add bookmark
  async addBookmark(bookmark: Omit<Bookmark, '_id' | 'createdAt'>): Promise<{ success: boolean; message: string; bookmark: Bookmark }> {
    return this.request<{ success: boolean; message: string; bookmark: Bookmark }>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(bookmark),
    });
  }

  // Get bookmarks
  async getBookmarks(lessonId?: string): Promise<{ success: boolean; bookmarks: Bookmark[] }> {
    const params = new URLSearchParams();
    if (lessonId) params.append('lessonId', lessonId);

    return this.request<{ success: boolean; bookmarks: Bookmark[] }>(`/bookmarks?${params.toString()}`);
  }

  // Update preferences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<{ success: boolean; message: string; preferences: UserPreferences }> {
    return this.request<{ success: boolean; message: string; preferences: UserPreferences }>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Get leaderboard
  async getLeaderboard(): Promise<{ success: boolean; leaderboard: any[] }> {
    return this.request<{ success: boolean; leaderboard: any[] }>('/leaderboard');
  }

  // Get public courses (no auth required)
  async getPublicCourses(): Promise<{ success: boolean; courses: Course[] }> {
    const response = await fetch(`${this.baseUrl}/courses/public`);
    if (!response.ok) {
      throw new Error(`Failed to fetch public courses: ${response.statusText}`);
    }
    return response.json();
  }

  // Admin: Create course
  async createCourse(courseData: any): Promise<{ success: boolean; message: string; course: Course }> {
    return this.request<{ success: boolean; message: string; course: Course }>('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  // Admin: Update course
  async updateCourse(courseId: string, updates: any): Promise<{ success: boolean; message: string; course: Course }> {
    return this.request<{ success: boolean; message: string; course: Course }>(`/admin/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Admin: Delete course
  async deleteCourse(courseId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/admin/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  // Admin: Get all courses
  async getAllCourses(): Promise<{ success: boolean; courses: Course[] }> {
    return this.request<{ success: boolean; courses: Course[] }>('/admin/courses');
  }

  // Admin: Get training statistics
  async getAdminStats(): Promise<{ success: boolean; stats: any }> {
    return this.request<{ success: boolean; stats: any }>('/admin/stats');
  }

  // Utility methods
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      'affiliate-marketing': 'Affiliate Marketing',
      'social-media': 'Social Media',
      'content-creation': 'Content Creation',
      'analytics': 'Analytics',
      'advanced-strategies': 'Advanced Strategies'
    };
    return names[category] || category;
  }

  calculateProgress(completedLessons: number, totalLessons: number): number {
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  }

  isCourseAccessible(course: Course, userLevel: string): boolean {
    if (course.isLocked) return false;
    if (!course.requiredLevel) return true;
    return userLevel === course.requiredLevel;
  }

  getNextLesson(course: Course, completedLessons: string[]): Lesson | null {
    return course.lessons.find(lesson => !completedLessons.includes(lesson._id)) || null;
  }

  getCompletedLessons(course: Course, completedLessons: string[]): Lesson[] {
    return course.lessons.filter(lesson => completedLessons.includes(lesson._id));
  }

  getRemainingLessons(course: Course, completedLessons: string[]): Lesson[] {
    return course.lessons.filter(lesson => !completedLessons.includes(lesson._id));
  }

  // Study session tracking
  private studySessionTimer: NodeJS.Timeout | null = null;
  private sessionStartTime: number = 0;

  startStudySession(courseId: string, lessonId: string): void {
    this.sessionStartTime = Date.now();
    this.recordStudySession({
      courseId,
      lessonId,
      duration: 0,
      action: 'start'
    });
  }

  pauseStudySession(courseId: string, lessonId: string): void {
    if (this.sessionStartTime > 0) {
      const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000 / 60); // Convert to minutes
      this.recordStudySession({
        courseId,
        lessonId,
        duration,
        action: 'pause'
      });
      this.sessionStartTime = 0;
    }
  }

  completeStudySession(courseId: string, lessonId: string): void {
    if (this.sessionStartTime > 0) {
      const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000 / 60); // Convert to minutes
      this.recordStudySession({
        courseId,
        lessonId,
        duration,
        action: 'complete'
      });
      this.sessionStartTime = 0;
    }
  }

  // Auto-save study progress
  startAutoSave(courseId: string, lessonId: string, interval: number = 30000): void {
    this.stopAutoSave();
    
    this.studySessionTimer = setInterval(() => {
      if (this.sessionStartTime > 0) {
        const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000 / 60);
        this.recordStudySession({
          courseId,
          lessonId,
          duration,
          action: 'pause'
        });
      }
    }, interval);
  }

  stopAutoSave(): void {
    if (this.studySessionTimer) {
      clearInterval(this.studySessionTimer);
      this.studySessionTimer = null;
    }
  }
}

export default new TrainingService(); 