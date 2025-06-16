import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const MockInterview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const sessionData = location.state || { domain: 'hr', difficulty: 'medium' };
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  console.log('MockInterview rendering - Session:', sessionId, 'Started:', interviewStarted);

  const handleStartInterview = () => {
    console.log('Starting interview...');
    setInterviewStarted(true);
    setConversation([
      {
        type: 'ai',
        message: "Hello! I'm your AI interviewer. Let's start with a simple question: Can you please introduce yourself and tell me about your background?",
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return;

    const userMessage = {
      type: 'user',
      message: currentMessage.trim(),
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        type: 'ai',
        message: "That's interesting! Can you tell me more about your experience with that?",
        timestamp: new Date()
      };
      setConversation(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleEndInterview = () => {
    navigate('/mock-interview-results', {
      state: {
        conversation,
        domain: sessionData.domain,
        difficulty: sessionData.difficulty,
        score: 85,
        feedback: 'Great job! You demonstrated good communication skills.'
      }
    });
  };

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center space-y-8">
            <div className="bg-black/30 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8">
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI Interview System
              </h1>
              <p className="text-xl text-gray-300 mb-4">
                Domain: <span className="text-cyan-400">{sessionData.domain}</span>
              </p>
              <p className="text-xl text-gray-300 mb-8">
                Difficulty: <span className="text-purple-400">{sessionData.difficulty}</span>
              </p>
              
              <button
                onClick={handleStartInterview}
                className="py-4 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                🚀 Start Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {sessionData.domain} Interview
          </h1>
          <p className="text-gray-300">Difficulty: {sessionData.difficulty}</p>
        </div>

        {/* Chat Container */}
        <div className="bg-black/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 h-96 overflow-y-auto mb-6">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                }`}
              >
                <p className="text-sm">{message.message}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg">
                <div className="animate-pulse">AI is typing...</div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-black/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4">
          <div className="flex space-x-4">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 bg-black/30 text-white placeholder-gray-400 rounded-lg p-3 border border-gray-600 focus:border-cyan-500 focus:outline-none resize-none"
              rows="3"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isTyping}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
              >
                Send
              </button>
              <button
                onClick={handleEndInterview}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                End
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Press Ctrl+Enter to send quickly</p>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
