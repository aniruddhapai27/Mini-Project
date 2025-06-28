import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { dqAPI } from '../utils/dqApi';
import { toast } from 'react-hot-toast';
import DotLottieLoader from './DotLottieLoader';

const QuizPerformanceGraph = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [timeframe, setTimeframe] = useState('30d');

  const subjects = [
    'Data Structures',
    'operating systems', 
    'computer networks',
    'database management systems',
    'software engineering',
    'algorithm design and analysis'
  ];

  // Colors for different subjects
  const subjectColors = {
    'Data Structures': '#8884d8',
    'operating systems': '#82ca9d',
    'computer networks': '#ffc658',
    'database management systems': '#ff7c7c',
    'software engineering': '#8dd1e1',
    'algorithm design and analysis': '#d084d0',
    'all': '#6366f1'
  };

  // Get available subjects from stats data
  const getAvailableSubjects = () => {
    if (!stats || !stats.subjectStats) return subjects;
    
    const availableSubjects = stats.subjectStats.map(s => s._id);
    console.log('Available subjects from API:', availableSubjects);
    
    // Always return the full subject list so users can see all options
    // But the ones with data will show graphs, others will show "no data" message
    return subjects;
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching quiz stats for:', {
        timeframe,
        subject: selectedSubject === 'all' ? null : selectedSubject,
        exactSubjectValue: selectedSubject
      });
      
      const response = await dqAPI.getQuizStats(
        timeframe, 
        selectedSubject === 'all' ? null : selectedSubject
      );
      
      console.log('Quiz stats response:', response);
      setStats(response.data);
    } catch (error) {
      console.error('Quiz stats error:', error);
      toast.error('Failed to fetch quiz statistics');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, timeframe]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatChartData = () => {
    if (!stats || !stats.dailyScores) {
      console.log('No stats or dailyScores available');
      return [];
    }

    console.log('Processing chart data:', {
      selectedSubject,
      dailyScoresLength: stats.dailyScores.length,
      dailyScores: stats.dailyScores
    });

    return stats.dailyScores.map(day => {
      const date = new Date(day.date);
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
      
      if (selectedSubject === 'all') {
        return {
          date: formattedDate,
          bestScore: day.overallBestScore,
          totalQuizzes: day.totalQuizzes,
          fullDate: day.date
        };
      } else {
        const subjectData = day.subjects.find(s => s.subject === selectedSubject);
        console.log(`Looking for subject "${selectedSubject}" in day ${formattedDate}:`, {
          availableSubjects: day.subjects.map(s => s.subject),
          foundSubjectData: subjectData
        });
        
        return {
          date: formattedDate,
          bestScore: subjectData ? subjectData.bestScore : 0,
          avgScore: subjectData ? Math.round(subjectData.avgScore) : 0,
          quizCount: subjectData ? subjectData.quizCount : 0,
          fullDate: day.date
        };
      }
    });
  };

  const formatSubjectData = () => {
    if (!stats || !stats.subjectStats) return [];

    console.log('Available subjects in stats:', stats.subjectStats.map(s => s._id));

    return stats.subjectStats.map(subject => ({
      subject: subject._id,
      avgScore: Math.round(subject.avgScore),
      bestScore: subject.bestScore,
      totalQuizzes: subject.totalQuizzes,
      accuracy: Math.round((subject.totalCorrect / subject.totalQuestions) * 100)
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey === 'bestScore' ? 'Best Score' : 
                 entry.dataKey === 'avgScore' ? 'Avg Score' : 
                 entry.dataKey === 'quizCount' ? 'Quiz Count' : entry.dataKey}: ${entry.value}${
                entry.dataKey.includes('Score') ? '%' : ''
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center h-64">
          <DotLottieLoader 
            size="w-8 h-8" 
            text="Loading quiz statistics..." 
            layout="horizontal"
            textColor="text-gray-400"
          />
        </div>
      </div>
    );
  }

  const chartData = formatChartData();
  const subjectData = formatSubjectData();

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-xl p-6 mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Quiz Performance Analytics</h2>
        
        <div className="flex flex-wrap gap-3">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Subjects</option>
            {getAvailableSubjects().map(subject => (
              <option key={subject} value={subject}>
                {subject === 'Data Structures' ? subject : subject.charAt(0).toUpperCase() + subject.slice(1)}
              </option>
            ))}
          </select>

          {/* Timeframe Filter */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && stats.overallStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {stats.overallStats.totalQuizzes}
            </div>
            <div className="text-sm text-gray-400">Total Quizzes</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(stats.overallStats.avgScore)}%
            </div>
            <div className="text-sm text-gray-400">Average Score</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.overallStats.bestScore}%
            </div>
            <div className="text-sm text-gray-400">Best Score</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stats.overallStats.totalQuestions > 0 
                ? Math.round((stats.overallStats.totalCorrect / stats.overallStats.totalQuestions) * 100)
                : 0}%
            </div>
            <div className="text-sm text-gray-400">Overall Accuracy</div>
          </div>
        </div>
      )}

      {/* Daily Performance Chart */}
      {chartData.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Daily Best Scores - {selectedSubject === 'all' ? 'All Subjects' : 
              selectedSubject === 'Data Structures' ? selectedSubject : 
              selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bestScore"
                  stroke={subjectColors[selectedSubject]}
                  strokeWidth={3}
                  dot={{ fill: subjectColors[selectedSubject], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Best Score (%)"
                />
                {selectedSubject !== 'all' && (
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#82ca9d', strokeWidth: 2, r: 3 }}
                    name="Avg Score (%)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          {selectedSubject === 'all' ? (
            <>
              <p className="text-gray-400">No quiz data available for the selected timeframe.</p>
              <p className="text-sm text-gray-500 mt-1">Take some quizzes to see your performance analytics!</p>
            </>
          ) : (
            <>
              <p className="text-gray-400">No quiz data available for "{selectedSubject === 'Data Structures' ? selectedSubject : selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}".</p>
              <p className="text-sm text-gray-500 mt-1">Take a {selectedSubject === 'Data Structures' ? selectedSubject : selectedSubject} quiz to see your performance for this subject!</p>
            </>
          )}
        </div>
      )}

      {/* Subject-wise Performance (when All Subjects is selected) */}
      {selectedSubject === 'all' && subjectData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Subject-wise Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number"
                  stroke="#9CA3AF"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <YAxis 
                  type="category"
                  dataKey="subject"
                  stroke="#9CA3AF"
                  fontSize={10}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="avgScore"
                  fill="#8884d8"
                  name="Avg Score (%)"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="bestScore"
                  fill="#82ca9d"
                  name="Best Score (%)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPerformanceGraph;
