import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import api from "../utils/api";
import DotLottieLoader from "./DotLottieLoader";

// Loading animation component
const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md border border-cyan-500/30 rounded-xl p-8 text-center max-w-md mx-4">
        <DotLottieLoader 
          size="lg" 
          text="AI is evaluating your ATS score and generating suggestions..." 
          layout="vertical"
          color="cyan"
        />
        
        {/* Progress bar */}
        <div className="mt-6 w-full bg-gray-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    </div>
  );
};

// Success animation component
const SuccessAnimation = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-green-900/95 to-emerald-900/95 backdrop-blur-md border border-green-500/30 rounded-xl p-8 text-center max-w-md mx-4 animate-slideInUp">
        <div className="mb-6">
          {/* Success checkmark with animation */}
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-ping"></div>
            <div className="absolute inset-1 bg-gray-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">Analysis Complete!</h3>
        <p className="text-gray-400 text-sm">Your resume has been successfully analyzed</p>
        
        <button
          onClick={onComplete}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
        >
          View Results
        </button>
      </div>
    </div>
  );
};

const ResumeATS = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Load saved results from localStorage on component mount
  useEffect(() => {
    const savedResult = localStorage.getItem('atsAnalysisResult');
    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);
        setAtsResult(parsedResult);
      } catch (error) {
        console.error('Failed to parse saved ATS result:', error);
        localStorage.removeItem('atsAnalysisResult');
      }
    }
  }, []);

  // Save results to localStorage whenever atsResult changes
  useEffect(() => {
    if (atsResult) {
      localStorage.setItem('atsAnalysisResult', JSON.stringify(atsResult));
    }
  }, [atsResult]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      analyzeResume(file);
    }
  };

  const analyzeResume = async (file) => {
    try {
      setAnalyzing(true);
      setError(null);

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Please upload a PDF, DOCX, or TXT file");
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Call the resume analysis API endpoint
      const response = await api.post('/api/v1/assistant/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });      if (response.data && response.data.content && response.data.content.length > 0) {
        const analysisData = response.data.content[0];
        
        // Parse and format the response data
        const formatResponse = (text) => {
          if (!text) return "";
          
          // If it's already formatted or doesn't need processing, return as is
          if (typeof text !== 'string') return text;
          
          // Clean up any escaped characters or JSON formatting issues
          let cleaned = text
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .trim();
          
          // If the text starts and ends with quotes, remove them
          if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.slice(1, -1);
          }
          
          return cleaned;
        };

        // Enhanced function to parse grammatical mistakes into a readable format
        const parseGrammaticalMistakes = (text) => {
          if (!text || typeof text !== 'string') return "";
          
          let formatted = formatResponse(text);
          
          // If the text contains bullet points with corrections, format them nicely
          if (formatted.includes('should be')) {
            // Split by common patterns and create proper markdown list
            const mistakes = formatted.split(/(?=- ')|(?=\n- )/).filter(item => item.trim());
            
            if (mistakes.length > 1) {
              return mistakes
                .map(mistake => {
                  // Clean up each mistake item
                  let cleanMistake = mistake.replace(/^- '/, '').replace(/'$/, '').trim();
                  if (cleanMistake.startsWith("'")) cleanMistake = cleanMistake.slice(1);
                  if (cleanMistake.endsWith("'")) cleanMistake = cleanMistake.slice(0, -1);
                  
                  // Format as a proper bullet point
                  return cleanMistake.startsWith('-') ? cleanMistake : `• ${cleanMistake}`;
                })
                .join('\n');
            }
          }
          
          return formatted;
        };

        setAtsResult({
          ats_score: Number(analysisData.ats_score) || 0,
          grammatical_mistakes: parseGrammaticalMistakes(analysisData.grammatical_mistakes || ""),
          suggestions: formatResponse(analysisData.suggestions || analysisData.improvement_suggestions || "")
        });
        setShowSuccess(true);
      } else {
        throw new Error("Invalid response format from analysis service");
      }

    } catch (error) {
      console.error('Resume analysis error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to analyze resume';
      
      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data?.detail?.includes('Failed to analyze the resume')) {
            errorMessage = 'The AI had trouble parsing your resume content. Please ensure your resume has clear, readable text and try again.';
          } else if (error.response.data?.detail?.includes('Unsupported file type')) {
            errorMessage = 'Please upload a PDF, DOCX, or TXT file.';
          } else if (error.response.data?.detail?.includes('empty')) {
            errorMessage = 'The uploaded file appears to be empty or unreadable. Please try a different file.';
          } else {
            errorMessage = error.response.data?.detail || 'Invalid file or content format.';
          }
        } else if (error.response.status === 500) {
          errorMessage = 'Server error during analysis. Please try again in a moment.';
        } else {
          errorMessage = error.response.data?.detail || `Server error (${error.response.status})`;
        }
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network connection issue. Please check your internet connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Analysis is taking longer than expected. Please try again with a smaller file.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred during analysis.';
      }
      
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
  };

  const clearAnalysis = () => {
    setAtsResult(null);
    setError(null);
    localStorage.removeItem('atsAnalysisResult');
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadAnalysis = () => {
    if (!atsResult) return;

    const analysisText = `
RESUME ATS ANALYSIS REPORT
Generated on: ${new Date().toLocaleDateString()}

ATS SCORE: ${atsResult.ats_score}%
Status: ${atsResult.ats_score >= 80 ? "Excellent" : atsResult.ats_score >= 60 ? "Good" : "Needs Improvement"}

GRAMMATICAL ISSUES:
${atsResult.grammatical_mistakes && atsResult.grammatical_mistakes.trim() !== "" 
  ? atsResult.grammatical_mistakes 
  : "No significant grammatical issues found."}

IMPROVEMENT SUGGESTIONS:
${atsResult.suggestions && atsResult.suggestions.trim() !== "" 
  ? atsResult.suggestions 
  : "Your resume is well-optimized. Keep up the good work!"}

---
Generated by Skill Wise AI Resume ATS Analyzer
    `.trim();

    const blob = new Blob([analysisText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-ats-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  // Enhanced functions for animated meter
  const getAnimatedStrokeColor = (score) => {
    if (score >= 80) return "#10b981"; // green-500
    if (score >= 60) return "#f59e0b"; // yellow-500  
    return "#ef4444"; // red-500
  };

  const getGradientStops = (score) => {
    if (score >= 80) {
      return [
        { offset: "0%", color: "#10b981" }, // green-500
        { offset: "100%", color: "#059669" } // green-600
      ];
    }
    if (score >= 60) {
      return [
        { offset: "0%", color: "#f59e0b" }, // yellow-500
        { offset: "100%", color: "#d97706" } // yellow-600
      ];
    }
    return [
      { offset: "0%", color: "#ef4444" }, // red-500
      { offset: "100%", color: "#dc2626" } // red-600
    ];
  };

  // Animated meter component
  const AnimatedScoreMeter = ({ score }) => {
    const [animatedScore, setAnimatedScore] = useState(0);
    const circumference = 2 * Math.PI * 50; // radius = 50
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
    const gradientStops = getGradientStops(score);

    useEffect(() => {
      const timer = setTimeout(() => {
        let currentScore = 0;
        const increment = score / 60; // 60 frames for 1 second animation at 60fps
        
        const animate = () => {
          currentScore += increment;
          if (currentScore <= score) {
            setAnimatedScore(currentScore);
            requestAnimationFrame(animate);
          } else {
            setAnimatedScore(score);
          }
        };
        
        requestAnimationFrame(animate);
      }, 300); // Start animation after 300ms delay

      return () => clearTimeout(timer);
    }, [score]);

    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <defs>
            <linearGradient id={`scoreGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              {gradientStops.map((stop, index) => (
                <stop key={index} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
            {/* Animated gradient for the filling effect */}
            <linearGradient id={`animatedGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="30%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#10b981" />
              <animateTransform
                attributeName="gradientTransform"
                type="rotate"
                values="0 60 60;360 60 60"
                dur="2s"
                repeatCount="1"
              />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="#374151"
            strokeWidth="8"
            fill="none"
            opacity="0.3"
          />
          
          {/* Animated progress circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke={`url(#scoreGradient-${score})`}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${getAnimatedStrokeColor(score)}30)`,
            }}
          />
          
          {/* Glow effect for high scores */}
          {score >= 80 && (
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#10b981"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              opacity="0.2"
              className="transition-all duration-1000 ease-out animate-pulse"
            />
          )}
        </svg>
        
        {/* Score text with animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${getScoreColor(score)} transition-all duration-500`}>
            {Math.round(animatedScore)}
          </span>
        </div>
        
        {/* Percentage symbol */}
        <div className="absolute bottom-8 right-8">
          <span className={`text-sm font-medium ${getScoreColor(score)} opacity-70`}>
            %
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {analyzing && <LoadingAnimation />}
      {showSuccess && <SuccessAnimation onComplete={handleSuccessComplete} />}
      
      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Resume ATS Analysis</h3>
              <p className="text-gray-400 text-sm">Get instant ATS score and improvement suggestions</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {atsResult ? (
          <div className="space-y-6">
            {/* Analysis Summary */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Resume Analysis Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(atsResult.ats_score)} mb-1`}>
                    {atsResult.ats_score}%
                  </div>
                  <div className="text-gray-400 text-sm">ATS Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${atsResult.grammatical_mistakes && atsResult.grammatical_mistakes.trim() !== "" ? 'text-yellow-400' : 'text-green-400'} mb-1`}>
                    {atsResult.grammatical_mistakes && atsResult.grammatical_mistakes.trim() !== "" ? '⚠️' : '✅'}
                  </div>
                  <div className="text-gray-400 text-sm">Grammar Check</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${atsResult.suggestions && atsResult.suggestions.trim() !== "" ? 'text-blue-400' : 'text-green-400'} mb-1`}>
                    {atsResult.suggestions && atsResult.suggestions.trim() !== "" ? '💡' : '🎯'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {atsResult.suggestions && atsResult.suggestions.trim() !== "" ? 'Has Suggestions' : 'Well Optimized'}
                  </div>
                </div>
              </div>
            </div>

            {/* ATS Score Display */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-lg p-6">
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center justify-center gap-2">
                  ATS Score
                  <div className="group relative">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      <div className="text-center">
                        <div className="font-semibold mb-1">ATS Score Meaning:</div>
                        <div>80-100: Excellent compatibility</div>
                        <div>60-79: Good with minor improvements</div>
                        <div>0-59: Needs significant optimization</div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </h4>
                
                {/* Animated Score Meter */}
                <AnimatedScoreMeter score={atsResult.ats_score} />
                
                {/* Score Status Badge */}
                <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getScoreGradient(atsResult.ats_score)} text-white text-sm font-medium mt-4 transform transition-all duration-500 hover:scale-105`}>
                  {atsResult.ats_score >= 80 ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Excellent
                    </span>
                  ) : atsResult.ats_score >= 60 ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Good
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Needs Improvement
                    </span>
                  )}
                </div>
              </div>
            </div>            {/* Grammatical Mistakes */}
            {atsResult.grammatical_mistakes && atsResult.grammatical_mistakes.trim() !== "" ? (
              <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Grammatical Issues
                </h4>
                <div className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="text-gray-300 mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="text-gray-300 list-disc list-inside mb-2 space-y-1 last:mb-0">{children}</ul>,
                      ol: ({ children }) => <ol className="text-gray-300 list-decimal list-inside mb-2 space-y-1 last:mb-0">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-300 pl-1">{children}</li>,
                      strong: ({ children }) => <strong className="text-yellow-300 font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="text-yellow-200 italic">{children}</em>,
                      code: ({ children }) => <code className="bg-yellow-900/30 text-yellow-200 px-2 py-1 rounded text-xs font-mono">{children}</code>,
                      h1: ({ children }) => <h1 className="text-yellow-300 text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-yellow-300 text-base font-semibold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-yellow-300 text-sm font-semibold mb-1">{children}</h3>,
                    }}
                  >
                    {atsResult.grammatical_mistakes}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Grammar Check
                </h4>
                <p className="text-green-300 text-sm">Great! No significant grammatical issues were found in your resume.</p>
              </div>
            )}            {/* Suggestions */}
            {atsResult.suggestions && atsResult.suggestions.trim() !== "" && (
              <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Improvement Suggestions
                </h4>
                <div className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="text-gray-300 mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="text-gray-300 list-disc list-inside mb-2 space-y-1 last:mb-0">{children}</ul>,
                      ol: ({ children }) => <ol className="text-gray-300 list-decimal list-inside mb-2 space-y-1 last:mb-0">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-300 pl-1">{children}</li>,
                      strong: ({ children }) => <strong className="text-blue-300 font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="text-blue-200 italic">{children}</em>,
                      code: ({ children }) => <code className="bg-blue-900/30 text-blue-200 px-2 py-1 rounded text-xs font-mono">{children}</code>,
                      h1: ({ children }) => <h1 className="text-blue-300 text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-blue-300 text-base font-semibold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-blue-300 text-sm font-semibold mb-1">{children}</h3>,
                      h4: ({ children }) => <h4 className="text-blue-300 text-sm font-medium mb-1">{children}</h4>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500/50 pl-4 py-2 bg-blue-900/10 rounded-r text-blue-200 italic mb-2">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {atsResult.suggestions}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={downloadAnalysis}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Analysis
              </button>
              <button
                onClick={() => {
                  clearAnalysis();
                  // Small delay to ensure the UI updates before opening file dialog
                  setTimeout(() => {
                    fileInputRef.current?.click();
                  }, 100);
                }}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Analyze Another Resume
              </button>
              <button
                onClick={clearAnalysis}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Results
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Upload Resume for ATS Analysis</h4>
              <p className="text-gray-400 mb-4">Get instant ATS score and personalized improvement suggestions</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Resume
              </button>
            </div>
            
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-cyan-400 font-medium mb-1">ATS Analysis Features</h5>
                  <ul className="text-cyan-300 text-sm space-y-1">
                    <li>• Instant ATS compatibility score</li>
                    <li>• Grammatical error detection</li>
                    <li>• Personalized improvement suggestions</li>
                    <li>• Industry-standard formatting tips</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </>
  );
};

export default ResumeATS;
