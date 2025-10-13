const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

const sampleCourses = [
  {
    title: 'Getting Started with Affiliate Marketing',
    description: 'Learn the fundamentals of affiliate marketing and how to start earning money online with Beam Affiliate Platform.',
    category: 'affiliate-marketing',
    level: 'beginner',
    instructor: 'Beam Team',
    thumbnail: null,
    requiredLevel: null,
    points: 100,
    sortOrder: 1,
    rating: 4.8,
    enrolledCount: 0,
    tags: ['beginner', 'fundamentals', 'getting-started'],
    difficulty: 'easy',
    language: 'en',
    lessons: [
      {
        title: 'What is Affiliate Marketing?',
        description: 'Introduction to affiliate marketing concepts and how it works.',
        type: 'video',
        content: 'Affiliate marketing is a performance-based marketing strategy where you earn commissions by promoting other people\'s products or services. In this lesson, we\'ll explore the basics of affiliate marketing and how it can help you generate income online.',
        duration: 15,
        videoUrl: 'https://example.com/videos/affiliate-marketing-intro.mp4',
        videoDuration: 900,
        points: 10,
        difficulty: 'easy',
        tags: ['introduction', 'basics']
      },
      {
        title: 'Understanding Commission Structures',
        description: 'Learn about different commission models and how to maximize your earnings.',
        type: 'text',
        content: `Commission structures vary widely in affiliate marketing. Here are the most common types:

1. **Percentage-based commissions**: You earn a percentage of each sale (e.g., 10-30%)
2. **Fixed-rate commissions**: You earn a fixed amount per sale (e.g., $50 per sale)
3. **Tiered commissions**: Your commission rate increases with sales volume
4. **Recurring commissions**: You earn ongoing commissions for subscription products

**Tips for maximizing commissions:**
- Focus on high-ticket items with good commission rates
- Build trust with your audience for better conversion rates
- Use multiple traffic sources to increase sales volume
- Track your performance and optimize your strategies`,
        duration: 20,
        points: 15,
        difficulty: 'easy',
        tags: ['commissions', 'earnings']
      },
      {
        title: 'Choosing Your Niche',
        description: 'How to select a profitable niche for your affiliate marketing business.',
        type: 'video',
        content: 'Selecting the right niche is crucial for affiliate marketing success. We\'ll discuss how to research and choose a niche that aligns with your interests and has good earning potential.',
        duration: 25,
        videoUrl: 'https://example.com/videos/choosing-niche.mp4',
        videoDuration: 1500,
        points: 20,
        difficulty: 'medium',
        tags: ['niche', 'research']
      },
      {
        title: 'Niche Selection Quiz',
        description: 'Test your understanding of niche selection principles.',
        type: 'quiz',
        content: 'Complete this quiz to test your knowledge of niche selection and affiliate marketing fundamentals.',
        duration: 10,
        points: 25,
        difficulty: 'easy',
        tags: ['quiz', 'assessment'],
        quiz: [
          {
            question: 'What is the primary goal of affiliate marketing?',
            options: [
              'To create products',
              'To earn commissions by promoting others\' products',
              'To build websites',
              'To manage social media accounts'
            ],
            correctAnswer: 1,
            explanation: 'Affiliate marketing is about earning commissions by promoting other people\'s products or services.'
          },
          {
            question: 'Which commission structure pays you a percentage of each sale?',
            options: [
              'Fixed-rate commissions',
              'Percentage-based commissions',
              'Tiered commissions',
              'Recurring commissions'
            ],
            correctAnswer: 1,
            explanation: 'Percentage-based commissions pay you a percentage of each sale amount.'
          },
          {
            question: 'What should you consider when choosing a niche?',
            options: [
              'Only your personal interests',
              'Only market demand',
              'Both personal interest and market demand',
              'Only competition level'
            ],
            correctAnswer: 2,
            explanation: 'The best niches combine your personal interests with market demand and manageable competition.'
          }
        ]
      }
    ]
  },
  {
    title: 'Social Media Marketing for Affiliates',
    description: 'Master social media marketing strategies to promote affiliate products effectively and build your audience.',
    category: 'social-media',
    level: 'intermediate',
    instructor: 'Sarah Johnson',
    thumbnail: null,
    requiredLevel: 'Beginner',
    points: 150,
    sortOrder: 2,
    rating: 4.6,
    enrolledCount: 0,
    tags: ['social-media', 'marketing', 'intermediate'],
    difficulty: 'medium',
    language: 'en',
    lessons: [
      {
        title: 'Platform Selection Strategy',
        description: 'Learn how to choose the right social media platforms for your affiliate marketing.',
        type: 'video',
        content: 'Different social media platforms have different audiences and content formats. We\'ll explore how to select the best platforms for your niche and target audience.',
        duration: 20,
        videoUrl: 'https://example.com/videos/platform-selection.mp4',
        videoDuration: 1200,
        points: 15,
        difficulty: 'medium',
        tags: ['platforms', 'strategy']
      },
      {
        title: 'Content Creation for Social Media',
        description: 'Create engaging content that drives traffic and conversions.',
        type: 'text',
        content: `Creating compelling content is essential for social media success. Here are key strategies:

**Content Types:**
- Educational posts that provide value
- Product reviews and recommendations
- Behind-the-scenes content
- User-generated content
- Live videos and stories

**Content Calendar Tips:**
- Plan content 2-4 weeks in advance
- Mix promotional and educational content (80/20 rule)
- Post consistently (3-5 times per week)
- Use trending hashtags and topics
- Engage with your audience regularly

**Visual Content:**
- Use high-quality images and videos
- Create branded templates
- Optimize for each platform's dimensions
- Include clear calls-to-action`,
        duration: 30,
        points: 25,
        difficulty: 'medium',
        tags: ['content', 'creation']
      },
      {
        title: 'Building Your Social Media Audience',
        description: 'Strategies to grow your social media following organically.',
        type: 'video',
        content: 'Growing your social media audience takes time and strategy. We\'ll cover organic growth techniques that will help you build a loyal following.',
        duration: 25,
        videoUrl: 'https://example.com/videos/audience-building.mp4',
        videoDuration: 1500,
        points: 20,
        difficulty: 'medium',
        tags: ['audience', 'growth']
      },
      {
        title: 'Social Media Marketing Quiz',
        description: 'Test your knowledge of social media marketing strategies.',
        type: 'quiz',
        content: 'Complete this quiz to assess your understanding of social media marketing for affiliates.',
        duration: 15,
        points: 30,
        difficulty: 'medium',
        tags: ['quiz', 'social-media'],
        quiz: [
          {
            question: 'What is the 80/20 rule in social media content?',
            options: [
              '80% promotional, 20% educational',
              '80% educational, 20% promotional',
              '80% video, 20% text',
              '80% original, 20% shared content'
            ],
            correctAnswer: 1,
            explanation: 'The 80/20 rule suggests 80% of your content should provide value (educational) and only 20% should be promotional.'
          },
          {
            question: 'Which content type typically generates the most engagement?',
            options: [
              'Text-only posts',
              'Image posts',
              'Video content',
              'Link posts'
            ],
            correctAnswer: 2,
            explanation: 'Video content typically generates the highest engagement rates across most social media platforms.'
          },
          {
            question: 'How often should you post on social media for optimal engagement?',
            options: [
              'Once per month',
              'Once per week',
              '3-5 times per week',
              'Multiple times per day'
            ],
            correctAnswer: 2,
            explanation: 'Posting 3-5 times per week is generally optimal for maintaining engagement without overwhelming your audience.'
          }
        ]
      }
    ]
  },
  {
    title: 'Advanced Analytics and Optimization',
    description: 'Learn advanced analytics techniques to track performance, optimize campaigns, and maximize your affiliate earnings.',
    category: 'analytics',
    level: 'advanced',
    instructor: 'Michael Chen',
    thumbnail: null,
    requiredLevel: 'Active',
    points: 200,
    sortOrder: 3,
    rating: 4.9,
    enrolledCount: 0,
    tags: ['analytics', 'optimization', 'advanced'],
    difficulty: 'hard',
    language: 'en',
    lessons: [
      {
        title: 'Understanding Key Performance Indicators',
        description: 'Master the essential KPIs for affiliate marketing success.',
        type: 'video',
        content: 'Key Performance Indicators (KPIs) are crucial for measuring and improving your affiliate marketing performance. We\'ll dive deep into the most important metrics.',
        duration: 30,
        videoUrl: 'https://example.com/videos/kpi-mastery.mp4',
        videoDuration: 1800,
        points: 25,
        difficulty: 'hard',
        tags: ['kpis', 'metrics']
      },
      {
        title: 'Conversion Rate Optimization',
        description: 'Advanced techniques to improve your conversion rates and boost earnings.',
        type: 'text',
        content: `Conversion Rate Optimization (CRO) is the systematic process of increasing the percentage of visitors who take a desired action. Here are advanced strategies:

**A/B Testing Framework:**
1. **Hypothesis Formation**: Based on data analysis
2. **Test Design**: Create variations with clear differences
3. **Statistical Significance**: Ensure reliable results
4. **Implementation**: Apply winning variations

**Key Optimization Areas:**
- **Landing Page Design**: Clear value proposition, strong CTAs
- **Trust Signals**: Testimonials, reviews, security badges
- **Page Speed**: Optimize loading times
- **Mobile Experience**: Ensure mobile-friendly design
- **Social Proof**: Showcase user testimonials and case studies

**Advanced Techniques:**
- **Multivariate Testing**: Test multiple elements simultaneously
- **Personalization**: Tailor content to user segments
- **Behavioral Targeting**: Use user behavior data
- **Exit Intent Popups**: Capture leaving visitors

**Tools and Analytics:**
- Google Analytics 4
- Hotjar for heatmaps
- Optimizely for A/B testing
- Crazy Egg for user behavior analysis`,
        duration: 40,
        points: 35,
        difficulty: 'hard',
        tags: ['cro', 'optimization']
      },
      {
        title: 'Advanced Analytics Quiz',
        description: 'Test your understanding of advanced analytics concepts.',
        type: 'quiz',
        content: 'Complete this comprehensive quiz on advanced analytics and optimization techniques.',
        duration: 20,
        points: 40,
        difficulty: 'hard',
        tags: ['quiz', 'analytics'],
        quiz: [
          {
            question: 'What is the minimum sample size typically needed for statistically significant A/B test results?',
            options: [
              '100 visitors per variation',
              '1,000 visitors per variation',
              '10,000 visitors per variation',
              'It depends on the conversion rate and desired confidence level'
            ],
            correctAnswer: 3,
            explanation: 'Sample size requirements depend on the conversion rate and desired confidence level. Higher conversion rates require smaller samples.'
          },
          {
            question: 'Which metric is most important for measuring affiliate marketing success?',
            options: [
              'Click-through rate (CTR)',
              'Conversion rate',
              'Revenue per click (RPC)',
              'All of the above are equally important'
            ],
            correctAnswer: 2,
            explanation: 'While all metrics are important, conversion rate directly impacts your earnings and is the most critical for success.'
          },
          {
            question: 'What is the primary goal of conversion rate optimization?',
            options: [
              'Increase website traffic',
              'Reduce bounce rate',
              'Increase the percentage of visitors who take desired actions',
              'Improve page load speed'
            ],
            correctAnswer: 2,
            explanation: 'CRO focuses on increasing the percentage of visitors who complete desired actions like making a purchase.'
          }
        ]
      }
    ]
  }
];

const seedTrainingData = async () => {
  try {
    console.log('🌱 Seeding training data...');

    // Clear existing training data
    await Course.deleteMany({});
    await Lesson.deleteMany({});

    // Create lessons first
    const createdLessons = [];
    
    for (const courseData of sampleCourses) {
      const courseLessons = [];
      
      for (const lessonData of courseData.lessons) {
        const lesson = new Lesson({
          title: lessonData.title,
          description: lessonData.description,
          type: lessonData.type,
          content: lessonData.content,
          duration: lessonData.duration,
          videoUrl: lessonData.videoUrl,
          videoDuration: lessonData.videoDuration,
          points: lessonData.points,
          difficulty: lessonData.difficulty,
          tags: lessonData.tags,
          quiz: lessonData.quiz || [],
          isActive: true
        });
        
        const savedLesson = await lesson.save();
        courseLessons.push(savedLesson._id);
        createdLessons.push(savedLesson);
      }
      
      // Create course with lesson references
      const course = new Course({
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        instructor: courseData.instructor,
        lessons: courseLessons,
        thumbnail: courseData.thumbnail,
        requiredLevel: courseData.requiredLevel,
        points: courseData.points,
        sortOrder: courseData.sortOrder,
        rating: courseData.rating,
        enrolledCount: courseData.enrolledCount,
        tags: courseData.tags,
        difficulty: courseData.difficulty,
        language: courseData.language,
        isActive: true
      });
      
      await course.save();
    }

    console.log(`✅ Training data seeded successfully!`);
    console.log(`📚 Created ${sampleCourses.length} courses`);
    console.log(`📖 Created ${createdLessons.length} lessons`);

  } catch (error) {
    console.error('❌ Error seeding training data:', error);
  }
};

module.exports = { seedTrainingData }; 