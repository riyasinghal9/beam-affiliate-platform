import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlayIcon,
  DocumentTextIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  BookOpenIcon,
  AcademicCapIcon,
  TrophyIcon,
  StarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface TrainingMaterial {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'image' | 'audio';
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  url: string;
  isCompleted?: boolean;
  progress?: number;
}

interface MarketingMaterial {
  id: string;
  title: string;
  description: string;
  type: 'banner' | 'text' | 'social' | 'email';
  format: 'png' | 'jpg' | 'pdf' | 'txt' | 'html';
  size: string;
  url: string;
  tags: string[];
}

const Training: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tutorials');
  const [selectedMaterial, setSelectedMaterial] = useState<TrainingMaterial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const [tutorials] = useState<TrainingMaterial[]>([
    {
      id: '1',
      title: 'Getting Started with Beam Affiliate',
      description: 'Learn the basics of the Beam Wallet affiliate program and how to start earning.',
      type: 'video',
      duration: '15:30',
      difficulty: 'beginner',
      thumbnail: '/api/materials/thumbnails/getting-started.jpg',
      url: '/api/materials/videos/getting-started.mp4',
      isCompleted: true,
      progress: 100
    },
    {
      id: '2',
      title: 'Advanced Sales Techniques',
      description: 'Master advanced sales strategies to maximize your commission earnings.',
      type: 'video',
      duration: '28:45',
      difficulty: 'advanced',
      thumbnail: '/api/materials/thumbnails/advanced-sales.jpg',
      url: '/api/materials/videos/advanced-sales.mp4',
      isCompleted: false,
      progress: 0
    },
    {
      id: '3',
      title: 'Social Media Marketing Guide',
      description: 'Complete guide to promoting Beam Wallet on social media platforms.',
      type: 'document',
      difficulty: 'intermediate',
      url: '/api/materials/documents/social-media-guide.pdf'
    },
    {
      id: '4',
      title: 'Email Marketing Best Practices',
      description: 'Learn how to create effective email campaigns for Beam Wallet promotion.',
      type: 'audio',
      duration: '22:15',
      difficulty: 'intermediate',
      url: '/api/materials/audio/email-marketing.mp3'
    }
  ]);

  const [marketingMaterials] = useState<MarketingMaterial[]>([
    {
      id: '1',
      title: 'Beam Wallet Installation Banner',
      description: 'Professional banner for promoting Beam Wallet installation services.',
      type: 'banner',
      format: 'png',
      size: '1200x630px',
      url: '/api/materials/banners/installation-banner.png',
      tags: ['installation', 'banner', 'social-media']
    },
    {
      id: '2',
      title: 'Commercial License Promotion Text',
      description: 'Ready-to-use promotional text for commercial agent licenses.',
      type: 'text',
      format: 'txt',
      size: '2.5KB',
      url: '/api/materials/texts/commercial-license.txt',
      tags: ['commercial', 'text', 'whatsapp']
    },
    {
      id: '3',
      title: 'Social Media Post Templates',
      description: 'Collection of social media post templates for different platforms.',
      type: 'social',
      format: 'pdf',
      size: '1.2MB',
      url: '/api/materials/social/social-templates.pdf',
      tags: ['social-media', 'templates', 'posts']
    },
    {
      id: '4',
      title: 'Email Newsletter Template',
      description: 'Professional email template for promoting Beam Wallet services.',
      type: 'email',
      format: 'html',
      size: '45KB',
      url: '/api/materials/email/newsletter-template.html',
      tags: ['email', 'newsletter', 'template']
    }
  ]);

  const [salesStrategies] = useState([
    {
      id: '1',
      title: 'Local Business Outreach',
      description: 'Target local businesses in your area for Beam Wallet installations.',
      difficulty: 'beginner',
      estimatedEarnings: '$500-2000/month',
      timeInvestment: '2-3 hours/day',
      steps: [
        'Research local businesses in your area',
        'Create a professional pitch',
        'Schedule meetings with business owners',
        'Present Beam Wallet benefits',
        'Follow up and close deals'
      ]
    },
    {
      id: '2',
      title: 'Social Media Influencer Partnership',
      description: 'Partner with influencers to promote Beam Wallet to their audience.',
      difficulty: 'advanced',
      estimatedEarnings: '$2000-10000/month',
      timeInvestment: '1-2 hours/day',
      steps: [
        'Identify relevant influencers in your niche',
        'Research their audience and engagement',
        'Create compelling partnership proposals',
        'Negotiate commission sharing',
        'Monitor and optimize performance'
      ]
    },
    {
      id: '3',
      title: 'WhatsApp Group Marketing',
      description: 'Leverage WhatsApp groups to promote Beam Wallet services.',
      difficulty: 'intermediate',
      estimatedEarnings: '$300-1500/month',
      timeInvestment: '1 hour/day',
      steps: [
        'Join relevant WhatsApp groups',
        'Build relationships with group members',
        'Share valuable content regularly',
        'Promote Beam Wallet naturally',
        'Track and measure results'
      ]
    }
  ]);

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || tutorial.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayIcon className="h-6 w-6" />;
      case 'document': return <DocumentTextIcon className="h-6 w-6" />;
      case 'image': return <PhotoIcon className="h-6 w-6" />;
      case 'audio': return <SpeakerWaveIcon className="h-6 w-6" />;
      default: return <DocumentTextIcon className="h-6 w-6" />;
    }
  };

  const downloadMaterial = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Training & Resources</h1>
          <p className="text-xl text-gray-600">Master the art of selling Beam Wallet and maximize your earnings</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Learning Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {tutorials.filter(t => t.isCompleted).length}/{tutorials.length}
              </div>
              <p className="text-gray-600">Tutorials Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(tutorials.reduce((acc, t) => acc + (t.progress || 0), 0) / tutorials.length)}%
              </div>
              <p className="text-gray-600">Overall Progress</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {marketingMaterials.length}
              </div>
              <p className="text-gray-600">Resources Available</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('tutorials')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tutorials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpenIcon className="h-5 w-5 inline mr-2" />
                Tutorials
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'materials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <PhotoIcon className="h-5 w-5 inline mr-2" />
                Marketing Materials
              </button>
              <button
                onClick={() => setActiveTab('strategies')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'strategies'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <AcademicCapIcon className="h-5 w-5 inline mr-2" />
                Sales Strategies
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tutorials Tab */}
            {activeTab === 'tutorials' && (
              <div>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search tutorials..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Tutorials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTutorials.map((tutorial) => (
                    <div key={tutorial.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(tutorial.type)}
                          <span className="text-sm font-medium text-gray-600">{tutorial.type}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                          {tutorial.difficulty}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{tutorial.description}</p>
                      
                      {tutorial.duration && (
                        <p className="text-sm text-gray-500 mb-4">Duration: {tutorial.duration}</p>
                      )}
                      
                      {/* Progress Bar */}
                      {tutorial.progress !== undefined && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{tutorial.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${tutorial.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedMaterial(tutorial)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {tutorial.isCompleted ? 'Review' : 'Start'}
                        </button>
                        {tutorial.isCompleted && (
                          <div className="flex items-center text-green-600">
                            <CheckCircleIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marketing Materials Tab */}
            {activeTab === 'materials' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketingMaterials.map((material) => (
                    <div key={material.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-600 uppercase">{material.type}</span>
                        <span className="text-sm text-gray-500">{material.size}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{material.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{material.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {material.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => downloadMaterial(material.url, material.title)}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sales Strategies Tab */}
            {activeTab === 'strategies' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {salesStrategies.map((strategy) => (
                    <div key={strategy.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(strategy.difficulty)}`}>
                          {strategy.difficulty}
                        </span>
                        <div className="flex items-center text-yellow-500">
                          <StarIcon className="h-4 w-4" />
                          <span className="text-sm font-medium ml-1">Recommended</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{strategy.title}</h3>
                      <p className="text-gray-600 mb-4">{strategy.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-lg font-bold text-green-600">{strategy.estimatedEarnings}</div>
                          <div className="text-sm text-gray-600">Estimated Earnings</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{strategy.timeInvestment}</div>
                          <div className="text-sm text-gray-600">Time Investment</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Implementation Steps:</h4>
                        <ol className="space-y-2">
                          {strategy.steps.map((step, index) => (
                            <li key={index} className="flex items-start">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                                {index + 1}
                              </span>
                              <span className="text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Material Viewer Modal */}
        {selectedMaterial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMaterial.title}</h2>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">{selectedMaterial.description}</p>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                {selectedMaterial.type === 'video' && (
                  <video
                    controls
                    className="w-full rounded-lg"
                    src={selectedMaterial.url}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                {selectedMaterial.type === 'document' && (
                  <iframe
                    src={selectedMaterial.url}
                    className="w-full h-96 rounded-lg"
                    title={selectedMaterial.title}
                  />
                )}
                {selectedMaterial.type === 'audio' && (
                  <audio
                    controls
                    className="w-full"
                    src={selectedMaterial.url}
                  >
                    Your browser does not support the audio tag.
                  </audio>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => downloadMaterial(selectedMaterial.url, selectedMaterial.title)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Download
                </button>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Training; 