import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { studyAssistantApi } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import ErrorBoundary from '../components/ErrorBoundary';
import { FaTrash } from 'react-icons/fa';

const StudyAssistant = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user: _user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  // State management
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ADA');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const subjects = [
    { key: 'ADA', name: 'Algorithm Design & Analysis', icon: '🔢', color: 'from-blue-500 to-cyan-500' },
    { key: 'CN', name: 'Computer Networks', icon: '🌐', color: 'from-green-500 to-emerald-500' },
    { key: 'DBMS', name: 'Database Management', icon: '💾', color: 'from-purple-500 to-violet-500' },
    { key: 'OS', name: 'Operating Systems', icon: '💻', color: 'from-orange-500 to-red-500' },
    { key: 'SE', name: 'Software Engineering', icon: '⚙️', color: 'from-indigo-500 to-blue-500' },
    { key: 'DS', name: 'Data Structures', icon: '📊', color: 'from-pink-500 to-rose-500' }
  ];
  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const response = await studyAssistantApi.getHistory();
      console.log('History response:', response);
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  // Load session messages
  const loadSessionMessages = useCallback(async (sessionIdToLoad) => {
    try {
      console.log('Loading session messages for ID:', sessionIdToLoad);
      setIsLoading(true);
      const response = await studyAssistantApi.getSession(sessionIdToLoad);
      console.log('Session response:', response);
      
      if (response && response.messages) {
        setMessages(response.messages);
        setCurrentSession(response.session);
        setSelectedSubject(response.session?.subject || 'ADA');
      } else {
        console.error('Invalid session response format:', response);
        toast.error('Invalid session data format');
      }    } catch (error) {
      console.error('Error loading session:', error);
      
      // Check if it's a 404 (session not found) vs other errors
      if (error.response && error.response.status === 404) {
        toast.error('Chat session not found. Redirecting to new session...');
      } else {
        toast.error('Failed to load chat session: ' + (error.message || 'Unknown error'));
      }
      
      // If the session doesn't exist or can't be loaded, redirect to new session after a brief delay
      setTimeout(() => {
        navigate('/study-assistant/new', { replace: true });
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);  // Create new chat session
  const createNewSession = useCallback(async (subject = selectedSubject) => {
    try {
      console.log('Starting new session for subject:', subject);
      
      // Don't create session immediately - just reset state and navigate
      const newSessionUrl = `/study-assistant/new`;
      console.log('Navigating to new session URL:', newSessionUrl);
      
      // Update URL and navigate
      navigate(newSessionUrl, { replace: true });
      
      // Reset current state - no session created yet
      setCurrentSession(null);
      setMessages([]);
      setSelectedSubject(subject);
      
      return 'new'; // Return 'new' as placeholder
    } catch (error) {
      console.error('Error setting up new session:', error);
      toast.error('Failed to start new chat session: ' + (error.message || 'Unknown error'));
      throw error;
    }
  }, [navigate, selectedSubject]);  // Send message
  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message immediately
    const userMessageObj = {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessageObj]);

    try {
      setIsLoading(true);
      console.log('Processing message:', userMessage);
      
      // Determine session ID - create session only when user sends first message
      let sessionIdToUse = currentSession?._id || sessionId;
      console.log('Current session ID:', sessionIdToUse);
      
      // If no session exists or it's 'new', create a new session with this first message
      if (!sessionIdToUse || sessionIdToUse === 'new') {
        console.log('Creating new session with first user message');
        
        // Send message to API without session_id - this will create a new session
        const response = await studyAssistantApi.sendMessage({
          user_query: userMessage,
          subject: selectedSubject,
          session_id: null // null will trigger session creation
        });

        // Update the session state with the new session ID
        const newSessionId = response.session_id;
        console.log('New session created with ID:', newSessionId);
        
        setCurrentSession({ _id: newSessionId, subject: selectedSubject });
        
        // Update URL to reflect the new session
        navigate(`/study-assistant/${newSessionId}`, { replace: true });
        
        // Refresh sessions list to include the new session
        fetchChatHistory();

        // Add AI response
        const aiMessageObj = {
          type: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessageObj]);
        
      } else {
        // Session already exists, continue the conversation
        console.log('Continuing existing session:', sessionIdToUse);
        
        const response = await studyAssistantApi.sendMessage({
          user_query: userMessage,
          subject: selectedSubject,
          session_id: sessionIdToUse
        });

        // Add AI response
        const aiMessageObj = {
          type: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessageObj]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {      setIsLoading(false);
    }
  }, [inputMessage, isLoading, currentSession, sessionId, selectedSubject, navigate, fetchChatHistory]);

  // Initialize component
  useEffect(() => {
    fetchChatHistory();
    
    // Load specific session if sessionId provided
    if (sessionId && sessionId !== 'new') {
      loadSessionMessages(sessionId);
    }
  }, [sessionId, navigate, loadSessionMessages, fetchChatHistory]);

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // Get subject info
  const getSubjectInfo = (key) => subjects.find(s => s.key === key) || subjects[0];

  // Show loading screen when initially loading a session
  if (isLoading && !currentSession && sessionId && sessionId !== 'new') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading chat session...</p>
        </div>
      </div>
    );
  }

  const handleDeleteSession = async (sessionIdToDelete) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      setIsLoadingSessions(true);
      await studyAssistantApi.deleteSession(sessionIdToDelete);
      toast.success('Session deleted');
      // Remove from local state
      setSessions(prev => prev.filter(s => s._id !== sessionIdToDelete));
      // If current session is deleted, go to new
      if (currentSession?._id === sessionIdToDelete) {
        navigate('/study-assistant/new', { replace: true });
        setCurrentSession(null);
        setMessages([]);
      }    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex relative overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="study-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="cyan" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#study-grid)" />
          </svg>
        </div>
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 overflow-hidden relative z-10`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Study Assistant</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors lg:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Subject Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject.key} value={subject.key}>
                    {subject.icon} {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* New Chat Button */}
            <button
              onClick={() => createNewSession()}
              className="w-full p-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/25"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Chat</span>
              </div>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Recent Chats</h3>
            
            {isLoadingSessions ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-800/50 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.414L3 21l2.414-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No chat history yet</p>
                <p className="text-gray-600 text-xs mt-1">Start a new conversation</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map(session => {
                  const subjectInfo = getSubjectInfo(session.subject);
                  const isActive = currentSession?._id === session._id;
                  
                  return (
                    <div key={session._id} className="relative group">
                      <button
                        onClick={() => {
                          if (!isActive) {
                            setIsLoadingSessions(true);
                            navigate(`/study-assistant/${session._id}`);
                            loadSessionMessages(session._id).finally(() => setIsLoadingSessions(false));
                          }
                        }}
                        className={`w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center space-x-3 ${
                          isActive 
                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 ring-2 ring-cyan-400/40' 
                            : 'bg-gray-800/30 hover:bg-gray-800/50 border border-transparent'
                        } ${isLoadingSessions && isActive ? 'opacity-60 pointer-events-none' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${subjectInfo.color} flex items-center justify-center text-sm`}>
                          {subjectInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {subjectInfo.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {/* Trash button, only if 3+ sessions */}
                        {sessions.length >= 3 && (
                          <button
                            className="ml-2 p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete session"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteSession(session._id);
                            }}
                            tabIndex={-1}
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </button>
                      {/* Loading indicator for switching */}
                      {isLoadingSessions && isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Chat Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getSubjectInfo(selectedSubject).color} flex items-center justify-center`}>
                  {getSubjectInfo(selectedSubject).icon}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{getSubjectInfo(selectedSubject).name}</h1>
                  <p className="text-sm text-gray-400">AI Study Assistant</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !currentSession ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.414L3 21l2.414-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Welcome to Study Assistant</h3>
                <p className="text-gray-400 mb-4">Ask me anything about {getSubjectInfo(selectedSubject).name}. I'm here to help you learn!</p>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="bg-gray-800/30 rounded-lg p-3 text-left">
                    <p className="text-gray-300">💡 Try asking: "Explain binary search algorithm"</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-3 text-left">
                    <p className="text-gray-300">🔍 Or: "What are the types of database normalization?"</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-4 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                    message.type === 'assistant' 
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {message.type === 'assistant' ? '🤖' : '👤'}
                  </div>
                  
                  <div className={`flex-1 max-w-[70%] ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`p-4 rounded-2xl backdrop-blur-sm ${
                      message.type === 'assistant'
                        ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                        : 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-white'                    }`}>                      {message.type === 'assistant' ? (
                        <ErrorBoundary fallbackMessage="Error rendering AI response">
                          <div className="markdown-content leading-relaxed prose prose-invert prose-sm max-w-none">
                            {message.content && typeof message.content === 'string' ? (
                              <ReactMarkdown 
                                components={{
                                  p: ({children, ...props}) => <p className="mb-2 last:mb-0" {...props}>{children}</p>,
                                  code: ({inline, children, ...props}) => 
                                    inline ? (
                                      <code className="bg-gray-700/50 px-1 py-0.5 rounded text-cyan-300" {...props}>
                                        {children}
                                      </code>
                                    ) : (
                                      <code className="block bg-gray-700/50 p-2 rounded-md text-green-300 overflow-x-auto" {...props}>
                                        {children}
                                      </code>
                                    ),
                                  pre: ({children, ...props}) => <pre className="bg-gray-700/50 p-2 rounded-md overflow-x-auto" {...props}>{children}</pre>,
                                  ul: ({children, ...props}) => <ul className="list-disc list-inside mb-2" {...props}>{children}</ul>,
                                  ol: ({children, ...props}) => <ol className="list-decimal list-inside mb-2" {...props}>{children}</ol>,
                                  li: ({children, ...props}) => <li className="mb-1" {...props}>{children}</li>,
                                  h1: ({children, ...props}) => <h1 className="text-lg font-bold mb-2 text-cyan-300" {...props}>{children}</h1>,
                                  h2: ({children, ...props}) => <h2 className="text-base font-semibold mb-2 text-cyan-300" {...props}>{children}</h2>,
                                  h3: ({children, ...props}) => <h3 className="text-sm font-semibold mb-1 text-cyan-300" {...props}>{children}</h3>,
                                  strong: ({children, ...props}) => <strong className="font-semibold text-white" {...props}>{children}</strong>,
                                  em: ({children, ...props}) => <em className="italic text-gray-300" {...props}>{children}</em>,
                                  blockquote: ({children, ...props}) => <blockquote className="border-l-2 border-cyan-500 pl-3 italic text-gray-300 mb-2" {...props}>{children}</blockquote>
                                }}
                              >
                                {String(message.content)}
                              </ReactMarkdown>
                            ) : (
                              <p className="leading-relaxed text-red-400">Error: Invalid message content</p>
                            )}
                          </div>
                        </ErrorBoundary>
                      ) : (
                        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div><div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white animate-pulse">
                    🤖
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-cyan-400 text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-t border-gray-700/50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask me anything about ${getSubjectInfo(selectedSubject).name}...`}
                  className="w-full p-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none min-h-[60px] max-h-[120px]"
                  disabled={isLoading}
                />
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`p-4 rounded-xl transition-all duration-300 ${
                  !inputMessage.trim() || isLoading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 shadow-lg hover:shadow-cyan-500/25'
                }`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{inputMessage.length}/2000</span>
            </div>
          </div>        </div>      </div>
    </div>
  );
};

export default StudyAssistant;
