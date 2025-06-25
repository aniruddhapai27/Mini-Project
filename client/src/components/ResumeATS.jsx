import { useState, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import api from "../utils/api";

// Loading animation component
const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md border border-cyan-500/30 rounded-xl p-8 text-center max-w-md mx-4">
        <div className="mb-6">
          {/* Animated brain icon */}
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-1 bg-gray-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">Analyzing Resume</h3>
        <p className="text-gray-400 text-sm">AI is evaluating your ATS score and generating suggestions...</p>
        
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
        setAtsResult({
          ats_score: analysisData.ats_score || 0,
          grammatical_mistakes: analysisData.grammatical_mistakes || "",
          suggestions: analysisData.suggestions || analysisData.improvement_suggestions || ""
        });
        setShowSuccess(true);
      } else {
        throw new Error("Invalid response format from analysis service");
      }

    } catch (error) {
      console.error('Resume analysis error:', error);
      setError(error.message || 'Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
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
            {/* ATS Score Display */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-lg p-6">
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-white mb-2">ATS Score</h4>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(atsResult.ats_score / 100) * 314} 314`}
                      className={`${getScoreColor(atsResult.ats_score)} transition-all duration-1000 ease-out`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(atsResult.ats_score)}`}>
                      {atsResult.ats_score}
                    </span>
                  </div>
                </div>
                <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getScoreGradient(atsResult.ats_score)} text-white text-sm font-medium mt-2`}>
                  {atsResult.ats_score >= 80 ? "Excellent" : atsResult.ats_score >= 60 ? "Good" : "Needs Improvement"}
                </div>
              </div>
            </div>            {/* Grammatical Mistakes */}
            {atsResult.grammatical_mistakes && (
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
                      p: ({ children }) => <p className="text-gray-300 mb-2">{children}</p>,
                      ul: ({ children }) => <ul className="text-gray-300 list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="text-gray-300 list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-300">{children}</li>,
                      strong: ({ children }) => <strong className="text-yellow-300 font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="text-yellow-200 italic">{children}</em>,
                      code: ({ children }) => <code className="bg-yellow-900/30 text-yellow-200 px-2 py-1 rounded text-xs font-mono">{children}</code>,
                    }}
                  >
                    {atsResult.grammatical_mistakes}
                  </ReactMarkdown>
                </div>
              </div>
            )}            {/* Suggestions */}
            {atsResult.suggestions && (
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
                      p: ({ children }) => <p className="text-gray-300 mb-2">{children}</p>,
                      ul: ({ children }) => <ul className="text-gray-300 list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="text-gray-300 list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-300">{children}</li>,
                      strong: ({ children }) => <strong className="text-blue-300 font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="text-blue-200 italic">{children}</em>,
                      code: ({ children }) => <code className="bg-blue-900/30 text-blue-200 px-2 py-1 rounded text-xs font-mono">{children}</code>,
                      h1: ({ children }) => <h1 className="text-blue-300 text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-blue-300 text-base font-semibold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-blue-300 text-sm font-semibold mb-1">{children}</h3>,
                    }}
                  >
                    {atsResult.suggestions}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Analyze Another Resume Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setAtsResult(null);
                  setError(null);
                  fileInputRef.current?.click();
                }}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Analyze Another Resume
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
