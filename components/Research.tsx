import React, { useState, useMemo, useRef, useEffect } from 'react';
import { queryResearchDocument, queryResearchDocumentChat } from '../services/gemini';

// Search suggestions based on common queries
const SEARCH_SUGGESTIONS = [
  "What chips are currently used for AI training?",
  "What is the difference between NVIDIA Hopper and Blackwell?",
  "Which companies make edge FPGAs?",
  "What is the memory bandwidth of AMD MI300X?",
  "How does Efficient Computer's Fabric architecture work?",
  "What is Heronic.ai's mosaIC tool?",
  "What are the power requirements for NVIDIA Rubin?",
  "Which GPU has the highest memory capacity?",
  "What is CDNA architecture?",
  "How does NVLink work?",
  "What is the difference between GPUs and FPGAs?",
  "What chips support FP4 precision?",
  "What is HBM4 memory?",
  "What companies compete with NVIDIA in AI chips?",
  "What is rack-scale integration?",
  "What is Intel Gaudi 3?",
  "How does Cerebras WSE-3 work?",
  "What is Google TPU Trillium?",
  "What is Groq LPU?",
  "What is SambaNova RDU?",
  "What is AWS Trainium?",
  "What is Graphcore IPU?",
  "What is Huawei Ascend?",
  "What is Microsoft Maia 100?",
  "What is Meta MTIA v2?",
  "What is Etched Soho?",
  "What is d-Matrix Corsair?",
  "What is Tenstorrent Wormhole?",
  "What is IBM NorthPole?",
  "What is Q.ANT photonic processor?",
];

interface SearchResult {
  answer: string;
  relevantSections: string[];
}

interface ChatResponse {
  content: string;
  suggestedQuestions?: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestedQuestions?: string[];
}

// 3-dot thinking animation component
const ThinkingDots: React.FC = () => {
  return (
    <div className="flex items-center gap-2.5">
      <div 
        className="w-2.5 h-2.5 bg-zinc-300 rounded-full" 
        style={{ 
          animation: 'thinking-bounce 1.4s ease-in-out infinite',
          animationDelay: '0ms',
          boxShadow: '0 0 12px rgba(212, 212, 216, 0.6)'
        }}
      ></div>
      <div 
        className="w-2.5 h-2.5 bg-zinc-300 rounded-full" 
        style={{ 
          animation: 'thinking-bounce 1.4s ease-in-out infinite',
          animationDelay: '200ms',
          boxShadow: '0 0 12px rgba(212, 212, 216, 0.6)'
        }}
      ></div>
      <div 
        className="w-2.5 h-2.5 bg-zinc-300 rounded-full" 
        style={{ 
          animation: 'thinking-bounce 1.4s ease-in-out infinite',
          animationDelay: '400ms',
          boxShadow: '0 0 12px rgba(212, 212, 216, 0.6)'
        }}
      ></div>
    </div>
  );
};

interface ResearchProps {
  initialSearchQuery?: string | null;
  onSearchComplete?: () => void;
}

export const Research: React.FC<ResearchProps> = ({ initialSearchQuery, onSearchComplete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Animated placeholder text
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const charIndexRef = useRef(0);
  const isTypingRef = useRef(true);

  // Chat mode state
  const [showChatMode, setShowChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatInput, setCurrentChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [originalSearchQuery, setOriginalSearchQuery] = useState('');
  const [originalSearchAnswer, setOriginalSearchAnswer] = useState('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);


  // Select 3 suggestions for animation
  const typeaheadSuggestions = useMemo(() => {
    const shuffled = [...SEARCH_SUGGESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  // Reset animation when suggestion changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAnimatedPlaceholder('');
      charIndexRef.current = 0;
      isTypingRef.current = true;
    }
  }, [currentSuggestionIndex, searchQuery]);

  // Animate typing/backspacing effect in placeholder
  useEffect(() => {
    if (searchQuery.trim()) {
      setAnimatedPlaceholder('');
      charIndexRef.current = 0;
      isTypingRef.current = true;
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const currentSuggestion = typeaheadSuggestions[currentSuggestionIndex];
    
    const animate = () => {
      if (isTypingRef.current) {
        // Typing forward
        if (charIndexRef.current < currentSuggestion.length) {
          setAnimatedPlaceholder(currentSuggestion.slice(0, charIndexRef.current + 1));
          charIndexRef.current++;
          animationRef.current = setTimeout(animate, 50 + Math.random() * 50);
        } else {
          // Finished typing, wait then start backspacing
          animationRef.current = setTimeout(() => {
            isTypingRef.current = false;
            animationRef.current = setTimeout(animate, 100);
          }, 2000);
        }
      } else {
        // Backspacing
        if (charIndexRef.current > 0) {
          setAnimatedPlaceholder(currentSuggestion.slice(0, charIndexRef.current - 1));
          charIndexRef.current--;
          animationRef.current = setTimeout(animate, 30);
        } else {
          // Finished backspacing, move to next suggestion
          setCurrentSuggestionIndex((prev) => (prev + 1) % typeaheadSuggestions.length);
          isTypingRef.current = true;
          charIndexRef.current = 0;
          animationRef.current = setTimeout(animate, 500);
        }
      }
    };

    animationRef.current = setTimeout(animate, 100);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [currentSuggestionIndex, typeaheadSuggestions, searchQuery]);

  const handleSearch = async (query: string = searchQuery): Promise<void> => {
    if (!query.trim()) {
      setSearchResults(null);
      // Close chat if open
      if (showChatMode) {
        setShowChatMode(false);
        setChatMessages([]);
        setCurrentChatInput('');
      }
      return;
    }

    setIsSearching(true);
    // Close chat mode when starting a new search
    if (showChatMode) {
      setShowChatMode(false);
      setChatMessages([]);
      setCurrentChatInput('');
    }
    
    // Minimum thinking time for better UX
    const startTime = Date.now();
    const minThinkingTime = 2000; // 2 seconds minimum
    
    try {
      const result = await queryResearchDocument(query);
      
      // Ensure minimum thinking time
      const elapsed = Date.now() - startTime;
      if (elapsed < minThinkingTime) {
        await new Promise(resolve => setTimeout(resolve, minThinkingTime - elapsed));
      }
      
      setSearchResults(result);
    } catch (error: any) {
      console.error('Search error:', error);
      
      // Ensure minimum thinking time even on error
      const elapsed = Date.now() - startTime;
      if (elapsed < minThinkingTime) {
        await new Promise(resolve => setTimeout(resolve, minThinkingTime - elapsed));
      }
      
      // Better error messages
      let errorMessage = "Sorry, I couldn't process your query. Please try again.";
      if (error?.message?.includes('API key')) {
        errorMessage = "API configuration error. Please check your Gemini API key in .env.local file.";
      } else if (error?.message?.includes('403') || error?.message?.includes('PERMISSION_DENIED')) {
        errorMessage = "API key issue detected. Please verify your Gemini API key is valid and not expired.";
      } else if (error?.message?.includes('leaked')) {
        errorMessage = "API key security issue. Please use a new, valid Gemini API key.";
      }
      
      setSearchResults({
        answer: errorMessage,
        relevantSections: []
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Chat handlers
  const handleDiveDeeperClick = async () => {
    if (!searchResults) return;
    
    // Store scroll position before transition
    const scrollY = window.scrollY;
    
    setOriginalSearchQuery(searchQuery);
    setOriginalSearchAnswer(searchResults.answer);
    
    // Add the initial search result as the first message
    const initialMessage: ChatMessage = {
      role: 'assistant',
      content: searchResults.answer
    };
    setChatMessages([initialMessage]);
    
    // Enable chat mode first
    setShowChatMode(true);
    
    // Prevent scroll jump - maintain current scroll position
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    });
    
    setIsChatLoading(true);
    
    // Minimum thinking time for better UX (3 seconds for dive deeper)
    const startTime = Date.now();
    const minThinkingTime = 3000; // 3 seconds minimum
    
    // Automatically generate a "dive deeper" response
    try {
      const diveDeeperPrompt = `Based on the initial query "${searchQuery}" and the answer provided, please dive deeper into this topic. Provide a comprehensive, detailed exploration that expands on the key points, explains underlying concepts, and offers additional insights. Format your response with short paragraphs (2-3 sentences) and bullet points for easy reading. Make it engaging and informative.`;
      
      const responseText = await queryResearchDocumentChat(
        searchQuery,
        searchResults.answer,
        [initialMessage],
        diveDeeperPrompt
      );
      
      // Ensure minimum thinking time
      const elapsed = Date.now() - startTime;
      if (elapsed < minThinkingTime) {
        await new Promise(resolve => setTimeout(resolve, minThinkingTime - elapsed));
      }
      
      // Parse response (may be JSON with suggested questions)
      let content = responseText;
      let suggestedQuestions: string[] = [];
      try {
        const parsed = JSON.parse(responseText);
        content = parsed.content || responseText;
        suggestedQuestions = parsed.suggestedQuestions || [];
      } catch (e) {
        // If not JSON, use as-is
        content = responseText;
      }
      
      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: content,
        suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : undefined
      };
      setChatMessages([initialMessage, assistantMessage]);
    } catch (error: any) {
      console.error('Dive deeper error:', error);
      
      // Ensure minimum thinking time even on error
      const elapsed = Date.now() - startTime;
      if (elapsed < minThinkingTime) {
        await new Promise(resolve => setTimeout(resolve, minThinkingTime - elapsed));
      }
      
      // Better error messages
      let errorMessage = "Sorry, I encountered an error while diving deeper. Please try asking a specific question.";
      if (error?.message?.includes('API key') || error?.message?.includes('403') || error?.message?.includes('PERMISSION_DENIED')) {
        errorMessage = "API configuration issue. Please check your Gemini API key in .env.local file. The key may be invalid or expired.";
      } else if (error?.message?.includes('leaked')) {
        errorMessage = "API key security issue detected. Please use a new, valid Gemini API key from Google AI Studio.";
      }
      
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: errorMessage
      };
      setChatMessages([initialMessage, errorChatMessage]);
    } finally {
      setIsChatLoading(false);
      // Focus chat input after transition completes
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 300);
    }
  };

  const handleChatSend = async (questionToSend?: string) => {
    const messageToSend = questionToSend || currentChatInput.trim();
    if (!messageToSend || isChatLoading) return;
    if (!originalSearchQuery || !originalSearchAnswer) return;

    const userMessage = messageToSend.trim();
    setCurrentChatInput('');
    
    // Add user message to chat
    const newUserMessage: ChatMessage = { role: 'user', content: userMessage };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setIsChatLoading(true);

    // Minimum thinking time for better UX (2 seconds for follow-up questions)
    const startTime = Date.now();
    const minThinkingTime = 2000; // 2 seconds minimum

    try {
      const responseText = await queryResearchDocumentChat(
        originalSearchQuery,
        originalSearchAnswer,
        chatMessages,
        userMessage
      );
      
      // Ensure minimum thinking time
      const elapsed = Date.now() - startTime;
      if (elapsed < minThinkingTime) {
        await new Promise(resolve => setTimeout(resolve, minThinkingTime - elapsed));
      }
      
      // Parse response (may be JSON with suggested questions)
      let content = responseText;
      let suggestedQuestions: string[] = [];
      try {
        const parsed = JSON.parse(responseText);
        content = parsed.content || responseText;
        suggestedQuestions = parsed.suggestedQuestions || [];
      } catch (e) {
        // If not JSON, use as-is
        content = responseText;
      }
      
      // Add assistant response to chat
      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: content,
        suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : undefined
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Ensure minimum thinking time even on error
      const elapsed = Date.now() - startTime;
      if (elapsed < minThinkingTime) {
        await new Promise(resolve => setTimeout(resolve, minThinkingTime - elapsed));
      }
      
      // Better error messages
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      if (error?.message?.includes('API key') || error?.message?.includes('403') || error?.message?.includes('PERMISSION_DENIED')) {
        errorMessage = "API configuration issue. Please check your Gemini API key in .env.local file.";
      } else if (error?.message?.includes('leaked')) {
        errorMessage = "API key security issue. Please use a new, valid Gemini API key.";
      }
      
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: errorMessage
      };
      setChatMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setIsChatLoading(false);
      // Focus input again after response
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const handleCloseChat = () => {
    setShowChatMode(false);
    setChatMessages([]);
    setCurrentChatInput('');
  };

  // Handle initial search query from card searches
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      const performSearch = async () => {
        await handleSearch(initialSearchQuery);
        if (onSearchComplete) {
          onSearchComplete();
        }
      };
      performSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchQuery]);

  // Scroll chat to bottom when new messages arrive - smooth and prevent page scroll
  useEffect(() => {
    if (showChatMode && chatMessagesEndRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        if (chatMessagesEndRef.current) {
          chatMessagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      });
    }
  }, [chatMessages, showChatMode]);

  // Prevent page scroll when entering chat mode
  useEffect(() => {
    if (showChatMode) {
      // Store current scroll position
      const scrollY = window.scrollY;
      const container = document.querySelector('[data-chat-container]');
      
      // Prevent scroll jump by maintaining position
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      });

      // Smoothly scroll container into view if needed, but don't jump
      if (container) {
        const rect = container.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isVisible) {
          // Only scroll if container is not visible, and do it smoothly
          setTimeout(() => {
            container.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }, 100);
        }
      }
    }
  }, [showChatMode]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes thinking-bounce {
          0%, 80%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          40% {
            transform: translateY(-12px) scale(1.1);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .slide-in-from-bottom-2 {
          animation: fade-in 0.3s ease-out forwards;
        }
        .slide-in-from-top-2 {
          animation: slide-in-from-top 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
      <div className="page-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-zinc-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D1623C]/40 to-transparent"></div>
          <span className="font-mono text-xs uppercase tracking-[0.5em] text-[#D1623C] font-semibold">Research</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D1623C]/40 to-transparent"></div>
        </div>
        <h1 className="text-5xl md:text-6xl font-light tracking-[-0.02em] leading-[1.1] text-white mb-4">
          Chip Topology <span className="text-[#D1623C] font-normal">Research</span>
        </h1>
        <p className="text-lg text-zinc-400 font-light">Comprehensive analysis of existing chip topologies and compute infrastructure</p>
      </div>

      {/* Search Interface */}
      <div className="mb-12 relative">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D1623C]/20 via-[#D1623C]/10 to-transparent rounded-xl blur-xl"></div>
          <div className="relative bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-2 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={animatedPlaceholder || ''}
                  className="w-full bg-transparent border-none outline-none text-white placeholder:text-zinc-500 text-lg px-4 py-3"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-[#D1623C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-[#D1623C] hover:bg-[#D1623C]/90 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Search Results / Chat Interface - Transforms into chat mode */}
      {searchResults && (
        <div 
          data-chat-container
          className={`mb-12 rounded-3xl overflow-hidden border transition-all duration-700 ease-out ${
            showChatMode 
              ? 'border-zinc-800/60 shadow-2xl' 
              : 'border-zinc-800/30 rounded-xl'
          }`}
          style={
            showChatMode
              ? {
                  background: 'linear-gradient(to bottom, rgba(24, 24, 27, 0.85) 0%, rgba(9, 9, 11, 0.9) 100%)',
                  backdropFilter: 'blur(40px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                  transform: 'translateZ(0)',
                  willChange: 'transform, opacity',
                }
              : {
                  background: 'rgba(24, 24, 27, 0.3)',
                  transform: 'translateZ(0)',
                }
          }
        >
          {!showChatMode ? (
            /* Initial Search Results View */
            <div className="p-8 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
                  <h2 className="text-2xl font-medium text-white">Search Results</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D1623C]/60 to-transparent"></div>
                </div>
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-zinc-300 leading-relaxed text-lg space-y-3" 
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {searchResults.answer.split('\n').map((line, idx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                        return (
                          <div key={idx} className="ml-6 flex items-start gap-2">
                            <span className="text-[#D1623C] mt-1">•</span>
                            <span>{trimmed.substring(1).trim()}</span>
                          </div>
                        );
                      }
                      return (
                        <p key={idx} className="mb-2">{trimmed}</p>
                      );
                    })}
                  </div>
                </div>
                {searchResults.relevantSections.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <h3 className="text-lg font-medium text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Related Sections</h3>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.relevantSections.map((section, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-sm text-zinc-300"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <button
                    onClick={handleDiveDeeperClick}
                    className="px-6 py-3 bg-[#D1623C] hover:bg-[#D1623C]/90 text-white font-medium rounded-lg transition-all flex items-center gap-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Dive Deeper in AI Mode
                  </button>
                </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
              {/* Header */}
              <div 
                className="flex items-center justify-between px-8 py-5 border-b border-zinc-800/40"
                style={{
                  background: 'linear-gradient(to bottom, rgba(24, 24, 27, 0.6), rgba(9, 9, 11, 0.4))',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D1623C] shadow-lg shadow-[#D1623C]/50 animate-pulse"></div>
                  <h3 className="font-mono text-xs font-semibold text-[#D1623C] tracking-[0.2em] uppercase">RCVC AI Mode</h3>
                </div>
                <button
                  onClick={handleCloseChat}
                  className="p-2 hover:bg-zinc-800/40 rounded-xl transition-all duration-200 group"
                  aria-label="Close chat"
                >
                  <svg className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages Container */}
              <div 
                className="overflow-y-auto px-8 py-8 space-y-6 scroll-smooth" 
                style={{ 
                  maxHeight: '600px', 
                  minHeight: '400px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(161, 161, 170, 0.3) transparent',
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {/* Messages */}
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-6 py-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-[#D1623C] to-[#B8543A] text-white shadow-xl shadow-[#D1623C]/40'
                          : 'text-zinc-100 border border-zinc-800/60'
                      }`}
                      style={
                        message.role === 'assistant'
                          ? {
                              background: 'linear-gradient(to bottom, rgba(39, 39, 42, 0.8), rgba(24, 24, 27, 0.6))',
                              backdropFilter: 'blur(20px)',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                            }
                          : {
                              boxShadow: '0 8px 32px rgba(209, 98, 60, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                            }
                      }
                    >
                      <div 
                        className="text-[15px] leading-[1.8] font-normal text-white space-y-2.5" 
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {message.content.split('\n').map((line, idx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return <br key={idx} />;
                          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                            return (
                              <div key={idx} className="ml-4 flex items-start gap-2">
                                <span className="text-[#D1623C] mt-1.5 flex-shrink-0">•</span>
                                <span>{trimmed.substring(1).trim()}</span>
                              </div>
                            );
                          }
                          if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                            return (
                              <p key={idx} className="font-semibold text-white mb-1">
                                {trimmed.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          return (
                            <p key={idx} className="mb-1">{trimmed}</p>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Suggested Questions */}
                    {message.role === 'assistant' && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                      <div className="max-w-[85%] space-y-2">
                        <p className="text-xs text-zinc-500 font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Suggested questions:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestedQuestions.map((question, qIndex) => (
                            <button
                              key={qIndex}
                              onClick={() => {
                                handleChatSend(question);
                              }}
                              className="px-4 py-2 text-sm text-zinc-300 bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/50 rounded-xl transition-all duration-200 hover:border-[#D1623C]/50 hover:text-white"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Thinking indicator */}
                {isChatLoading && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div 
                      className="border border-zinc-800/60 rounded-3xl px-6 py-4"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(39, 39, 42, 0.8), rgba(24, 24, 27, 0.6))',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                      }}
                    >
                      <ThinkingDots />
                    </div>
                  </div>
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Chat Input */}
              <div 
                className="border-t border-zinc-800/40 px-8 py-6"
                style={{
                  background: 'linear-gradient(to bottom, rgba(24, 24, 27, 0.6), rgba(9, 9, 11, 0.4))',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div 
                  className="relative flex items-center gap-4 rounded-2xl border border-zinc-800/60 transition-all duration-200 hover:border-zinc-700/60 focus-within:border-[#D1623C]/60 focus-within:ring-2 focus-within:ring-[#D1623C]/30"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(39, 39, 42, 0.7), rgba(24, 24, 27, 0.5))',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                  }}
                >
                  <button className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-800/30 rounded-xl transition-all duration-200 group">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={currentChatInput}
                    onChange={(e) => setCurrentChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder="Ask a follow-up question..."
                    disabled={isChatLoading}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-zinc-500 text-[15px] py-3 pr-4 disabled:opacity-50 font-normal"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <div className="flex items-center gap-3 pr-3">
                    <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>AI Mode</span>
                    <button
                      onClick={handleChatSend}
                      disabled={isChatLoading || !currentChatInput.trim()}
                      className="p-3 bg-gradient-to-br from-[#D1623C] to-[#B8543A] hover:from-[#E1704A] hover:to-[#D1623C] text-white rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#D1623C]/30 hover:shadow-[#D1623C]/50 hover:scale-105 active:scale-95"
                      aria-label="Send message"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content - All Research */}
      <div className="space-y-16">
        {/* General-Purpose Accelerators Section */}
        <section className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white tracking-[-0.01em]">
              General-Purpose <span className="text-[#D1623C]">Accelerators</span>
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
          </div>

          {/* NVIDIA Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium text-white">NVIDIA - GPU (Hopper, Blackwell, Rubin)</h3>
              <p className="text-lg text-zinc-300 leading-relaxed">
                Nvidia holds the dominant market share within the chip infra market with their GPUs. The GPU is the swiss army knife of AI. They utilize massively parallel architectures to handle almost any mathematical workload, making them the industry standard for training.
              </p>
            </div>

            {/* NVIDIA Main Image */}
            <div className="relative w-full aspect-video bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden group hover:border-[#D1623C]/50 transition-all shadow-2xl">
              <img 
                src="/NVIDIA.webp" 
                alt="NVIDIA GPU Architecture and Technologies"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ imageRendering: 'crisp-edges', filter: 'contrast(1.15) brightness(1.08) saturate(1.1)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h5 className="text-sm font-medium text-white mb-1">NVIDIA GPU Architecture</h5>
                <p className="text-xs text-zinc-400">Hopper, Blackwell, and Rubin platforms</p>
              </div>
            </div>

            {/* NVIDIA Architectures - Enhanced Grid */}
            <div className="space-y-6 mt-8">
              <div className="flex items-center gap-4">
                <h4 className="text-xl font-medium text-white">Nvidia Architectures</h4>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-2 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-lg font-medium text-[#D1623C]">Ampere (A100)</h5>
                    <span className="text-xs text-zinc-500 px-2 py-1 bg-zinc-800/50 rounded">Legacy</span>
                  </div>
                  <p className="text-zinc-300 text-sm">The legacy workhorse still used for mid-scale tasks.</p>
                </div>
                <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-2 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-lg font-medium text-[#D1623C]">Hopper (H100/H200)</h5>
                    <span className="text-xs text-[#D1623C] px-2 py-1 bg-[#D1623C]/10 rounded">Current</span>
                  </div>
                  <p className="text-zinc-300 text-sm">Current dominant architecture; introduced the Transformer Engine.</p>
                </div>
                <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-2 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-lg font-medium text-[#D1623C]">Blackwell (B100/B200)</h5>
                    <span className="text-xs text-[#D1623C] px-2 py-1 bg-[#D1623C]/10 rounded">2024-2025</span>
                  </div>
                  <p className="text-zinc-300 text-sm">The 2024-2025 standard introduced FP4 (4-bit floating point) precision and rack-scale integration.</p>
                </div>
                <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-2 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-lg font-medium text-[#D1623C]">Rubin (R100)</h5>
                    <span className="text-xs text-[#D1623C] px-2 py-1 bg-[#D1623C]/10 rounded">2026</span>
                  </div>
                  <p className="text-zinc-300 text-sm">The 2026 flagship. Features HBM4 memory, 6th Gen NVLink, and extreme co-design with the Vera CPU.</p>
                </div>
              </div>
            </div>

            {/* Technical Shift Explanation - Enhanced Layout */}
            <div className="space-y-6 mt-8">
              <div className="flex items-center gap-4 mb-6">
                <h4 className="text-xl font-medium text-white">The Technical Shift: Monolith to Factory Topology</h4>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 border border-zinc-800/50 rounded-xl hover:border-[#D1623C]/30 transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-[#D1623C]/20 flex items-center justify-center">
                      <span className="text-[#D1623C] font-bold text-sm">1</span>
                    </div>
                    <h5 className="font-medium text-white">Hopper: Monolithic</h5>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">A single, high-performance piece of silicon with the Transformer Engine. Like a world-class kitchen with one massive stove—powerful but requires duplicate kitchens to scale.</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 border border-zinc-800/50 rounded-xl hover:border-[#D1623C]/30 transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-[#D1623C]/20 flex items-center justify-center">
                      <span className="text-[#D1623C] font-bold text-sm">2</span>
                    </div>
                    <h5 className="font-medium text-white">Blackwell: Dual-Die</h5>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">Two chips fused by NV-HBI (10 TB/s bridge). An automated factory with decompression engines and micro-tensor scaling. NVLink 5 connects GPUs at 1.8 TB/s, creating a unified brain.</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 border border-zinc-800/50 rounded-xl hover:border-[#D1623C]/30 transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-[#D1623C]/20 flex items-center justify-center">
                      <span className="text-[#D1623C] font-bold text-sm">3</span>
                    </div>
                    <h5 className="font-medium text-white">Rubin: Rack-Scale</h5>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">Vera CPU (logistics hub) + Rubin GPU (hyper-efficient kitchen). Treats the entire rack as one unit. Built for System 2 thinking—solving multi-step problems autonomously.</p>
                </div>
              </div>
            </div>

            {/* Infrastructure Requirements - Enhanced */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[#D1623C]/10 via-zinc-900/50 to-zinc-900/50 border-l-4 border-[#D1623C] rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-6 w-1 bg-[#D1623C] rounded-full"></div>
                <h4 className="text-xl font-medium text-white">Infrastructure Requirements</h4>
              </div>
              <p className="text-zinc-300 leading-relaxed text-sm">
                To achieve this scale for Blackwell and Rubin, Nvidia requires liquid cooling (consuming $50k per rack for cooling components alone). Furthermore, these racks operate at extreme power densities, exceeding 120 kW per rack, which necessitates substantial data-center-level re-engineering to manage power delivery and heat rejection.
              </p>
            </div>
          </div>

          {/* AMD Section */}
          <div className="space-y-6 pt-8 border-t border-zinc-800">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium text-white">AMD Architectures</h3>
              <p className="text-lg text-zinc-300 leading-relaxed">
                Nvidia has long been the default choice for GPU in AI training. However, AMD is also actively working to carve a space out in high-performance computing (HPC) and enterprise AI.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-3">
                <h4 className="text-lg font-medium text-[#D1623C]">CDNA Architecture</h4>
                <p className="text-zinc-300 leading-relaxed">
                  AMD builds its data center GPUs on a dedicated architecture called CDNA (Compute DNA). This architecture targets HPC and AI workloads, focusing on raw compute performance, memory bandwidth, and scaling across multiple accelerators rather than graphics rendering. Compared to Nvidia which has deep framework integration with CUDA, AMD GPUs often provide more memory at a lower cost per GPU, making them attractive for memory-bound AI workloads such as LLMs with long context windows.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">CDNA1 (MI100 - 2020)</h5>
                  <p className="text-sm text-zinc-400">First dedicated compute GPU of the series, manufactured at 7nm, offering high-precision FP64 for scientific computing and matrix cores for AI</p>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">CDNA2 (MI200 Series - 2021)</h5>
                  <p className="text-sm text-zinc-400">Introduced MCM (Multi-Chip Module) design with 6nm technology. The MI250 achieved 4x the FP64 matrix performance of CDNA 1.</p>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">CDNA3 (MI300 Series - 2023/2024)</h5>
                  <p className="text-sm text-zinc-400">Features 5nm/6nm chiplets with 3D packaging (146+ billion transistors).</p>
                  <p className="text-sm text-zinc-400 mt-1">MI300X: Focused on Generative AI, featuring 192GB HBM3 memory (5.3 TB/s bandwidth) and 304 CUs (compute unit).</p>
                  <p className="text-sm text-zinc-400 mt-1">MI300A: World's first Data Center APU (accelerated processing unit), combining 24 "Zen 4" CPU cores with 6 CDNA 3 GPU dies for tightly coupled CPU + GPU performance. APUs have lower latency and higher energy efficiency than dedicated GPUs, but the processing power is overall lower.</p>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">CDNA4 (MI350 Series - 2025)</h5>
                  <p className="text-sm text-zinc-400">Latest released series (MI350X, MI355X), built on 3nm, offering up to 288 GB HBM3E memory and 8 TB/s bandwidth, designed to double low-precision AI performance compared to CDNA 3.</p>
                </div>
              </div>

              {/* AMD GPU Table */}
              <div className="overflow-x-auto mt-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">GPU</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Architecture</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Memory</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Peak Memory Bandwidth</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Best For</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-zinc-300">
                    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4">MI100</td>
                      <td className="py-3 px-4">CDNA</td>
                      <td className="py-3 px-4">32 GB HBM2</td>
                      <td className="py-3 px-4">1.2 TB/s</td>
                      <td className="py-3 px-4">Entry-level HPC</td>
                    </tr>
                    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4">MI250X</td>
                      <td className="py-3 px-4">CDNA 2</td>
                      <td className="py-3 px-4">128 GB HBM2e</td>
                      <td className="py-3 px-4">3.2 TB/s</td>
                      <td className="py-3 px-4">Mid-range AI inference</td>
                    </tr>
                    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4">MI300X</td>
                      <td className="py-3 px-4">CDNA 3</td>
                      <td className="py-3 px-4">192 GB HBM3</td>
                      <td className="py-3 px-4">5.3 TB/s</td>
                      <td className="py-3 px-4">High-performance LLM training & inference, HPC</td>
                    </tr>
                    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4">MI300A</td>
                      <td className="py-3 px-4">CDNA 3</td>
                      <td className="py-3 px-4">128 GB HBM3 (unified)</td>
                      <td className="py-3 px-4">5.3 TB/s</td>
                      <td className="py-3 px-4">Integrated AI/HPC workloads</td>
                    </tr>
                    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4">MI325X</td>
                      <td className="py-3 px-4">CDNA 3</td>
                      <td className="py-3 px-4">256 GB HBM3E</td>
                      <td className="py-3 px-4">6 TB/s</td>
                      <td className="py-3 px-4">Advanced LLM training & inference, FP8</td>
                    </tr>
                    <tr className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4">MI350X</td>
                      <td className="py-3 px-4">CDNA 4</td>
                      <td className="py-3 px-4">288 GB HBM3E</td>
                      <td className="py-3 px-4">8 TB/s</td>
                      <td className="py-3 px-4">Ultra-large models, long-context inference, next-gen AI</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* AMD GPUs Summary Image */}
              <div className="relative w-full aspect-video bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden mt-6 group hover:border-[#D1623C]/50 transition-all shadow-2xl">
                <img 
                  src="/amd.avif" 
                  alt="AMD GPU Architectures and CDNA Technology"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ imageRendering: 'crisp-edges', filter: 'contrast(1.12) brightness(1.06) saturate(1.08)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/85 via-zinc-900/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h5 className="text-sm font-medium text-white mb-1">AMD GPU Architectures</h5>
                  <p className="text-xs text-zinc-400">CDNA Series: MI100 through MI350X</p>
                </div>
              </div>
            </div>
          </div>

          {/* Intel Section */}
          <div className="space-y-6 pt-8 border-t border-zinc-800">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium text-white">Intel - Ponte Vecchio, Crescent Island</h3>
              <p className="text-lg text-zinc-300 leading-relaxed">
                While Intel is still the dominant player in the CPU market with about 70% of the market share, it is falling behind Nvidia and AMD in the GPU competition. The company is now rapidly chasing to gain more exposure to the AI boom but the strategy is very differentiated from the top two players: unlike Nvidia who emphasizes "performance at all costs" and AMD who aims at "More Memory for Less Money", Intel knows it cannot beat Nvidia on raw speed and tries to be the "Toyota Camry" of AI – cheap, reliable, and available everywhere.
              </p>
            </div>

            {/* NVIDIA vs Intel Comparison Image */}
            <div className="relative w-full aspect-[4/3] bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden group hover:border-[#D1623C]/50 transition-all shadow-2xl">
              <img 
                src="/nvidia-versus-intel-v0-c7rtc129nlld1.webp" 
                alt="NVIDIA vs Intel Market Capitalization Comparison"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                style={{ imageRendering: 'crisp-edges', filter: 'contrast(1.12) brightness(1.06) saturate(1.05)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-zinc-900/20 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                <h5 className="text-sm font-medium text-white mb-1">NVIDIA vs Intel - Market Capitalization</h5>
                <p className="text-xs text-zinc-400">Market cap comparison from 2010-2024</p>
              </div>
            </div>

            {/* Intel GPU Cards - Side by Side Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Ponte Vecchio Card */}
              <div className="p-6 bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 border border-zinc-800/50 rounded-xl space-y-4 hover:border-[#D1623C]/50 transition-all shadow-lg hover:shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-1 w-12 bg-[#D1623C] rounded-full"></div>
                  <h4 className="text-lg font-medium text-[#D1623C]">Ponte Vecchio</h4>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Intel's highest performing, highest density, general-purpose discrete GPU based on Xe architecture, designed for HPC and AI workloads.
                </p>
                <div className="space-y-3 mt-4">
                  <div className="p-3 bg-zinc-900/40 border-l-2 border-[#D1623C]/50 rounded-r hover:bg-zinc-900/60 transition-colors">
                    <h5 className="font-medium text-white text-sm mb-1">Max 1550 (600W)</h5>
                    <p className="text-xs text-zinc-400">128GB HBM2e, 3.2 TB/s • Liquid cooling required</p>
                  </div>
                  <div className="p-3 bg-zinc-900/40 border-l-2 border-zinc-700/50 rounded-r hover:bg-zinc-900/60 transition-colors">
                    <h5 className="font-medium text-white text-sm mb-1">Max 1350 (450W)</h5>
                    <p className="text-xs text-zinc-400">Air-cooled • 20-25% less throughput than 1550</p>
                  </div>
                  <div className="p-3 bg-zinc-900/40 border-l-2 border-zinc-700/50 rounded-r hover:bg-zinc-900/60 transition-colors">
                    <h5 className="font-medium text-white text-sm mb-1">Max 1100 (300W)</h5>
                    <p className="text-xs text-zinc-400">PCIe card • 48GB memory</p>
                  </div>
                </div>
              </div>

              {/* Crescent Island Card */}
              <div className="p-6 bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 border border-zinc-800/50 rounded-xl space-y-4 hover:border-[#D1623C]/50 transition-all shadow-lg hover:shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-1 w-12 bg-[#D1623C] rounded-full"></div>
                  <h4 className="text-lg font-medium text-[#D1623C]">Crescent Island (2026)</h4>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Cost and energy-optimized inference GPU using Xe3P architecture. Substitutes HBM with LPDDR5X to maximize Performance-per-Watt and Memory-per-Dollar.
                </p>
                <div className="mt-4 p-4 bg-gradient-to-r from-[#D1623C]/10 to-transparent border border-[#D1623C]/20 rounded-lg">
                  <p className="text-zinc-300 text-sm">
                    <span className="font-medium text-[#D1623C]">160GB LPDDR5X:</span> Holds large models (Llama-3 70B, Falcon 180B) on a single card, doubling energy efficiency vs competitors.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AMD Xilinx Versal Section */}
          <div className="space-y-6 pt-8 border-t border-zinc-800">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium text-white">AMD Xilinx Versal</h3>
              <p className="text-lg text-zinc-300 leading-relaxed">
                Compared to GPUs, which excel at compute-intensive tasks, FPGAs are better suited for storage-intensive tasks and are optimal for edge AI and inference due to the balance of performance, power and cost. In 2018, before AMD bought them, Xilinx developed a new category of chip called ACAP (Adaptive Compute Acceleration Platform) by combining CPU, FPGA and AI Accelerator.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-3 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                <div className="h-1 w-16 bg-[#D1623C] rounded-full"></div>
                <h4 className="text-lg font-medium text-[#D1623C]">AI Core Series</h4>
                <p className="text-zinc-300 text-sm leading-relaxed">Original heavy lifter for compute, designed for data center acceleration, 5G beamforming, and cloud-based AI inference. Highest compute density with AIE tiles optimized for ML and traditional signal processing.</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-3 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                <div className="h-1 w-16 bg-[#D1623C] rounded-full"></div>
                <h4 className="text-lg font-medium text-[#D1623C]">AI Edge Series</h4>
                <p className="text-zinc-300 text-sm leading-relaxed">Optimized for edge AI devices including robots, automotive, drones where latency and power are critical. Uses AIE-ML tiles optimized for INT8 and lower precision. Gen 2 adds hardened pre-processing blocks like ISPs and VCUs.</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-3 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                <div className="h-1 w-16 bg-[#D1623C] rounded-full"></div>
                <h4 className="text-lg font-medium text-[#D1623C]">Premium with AI Engines</h4>
                <p className="text-zinc-300 text-sm leading-relaxed">Specific subset (VP2502/VP2802) primarily for networking but integrates AI Engines to perform AI analysis directly on massive streams of network data without CPU tax.</p>
              </div>
            </div>
          </div>

          {/* Biren Technology Section */}
          <div className="space-y-6 pt-8 border-t border-zinc-800">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium text-white">Biren Technology - BR100</h3>
              <p className="text-lg text-zinc-300 leading-relaxed">
                The "Twin-Engine" Superchip. The BR100 is not one chip; it is two identical compute tiles "stitched" together on a single package. By printing two medium-sized chips (which are easier to make perfectly) and fusing them, Biren created a processor with 77 billion transistors—larger and more complex than what was physically possible with a single die at the time.
              </p>
            </div>

            <div className="mt-6 p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-4 hover:border-[#D1623C]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-[#D1623C] rounded-full"></div>
                <h4 className="text-lg font-medium text-[#D1623C]">Hejia Architecture & BLink Technology</h4>
              </div>
              <p className="text-zinc-300 leading-relaxed text-sm">
                The Hejia Architecture strips away "scientific" features (like FP64 math) to focus purely on "AI" features (BF16/INT8 math). BLink Technology is the proprietary high-speed interconnect (similar to NVLink) that allows these chiplets to talk to each other at massive speeds (512 GB/s). Biren claims the BR100 offers ~2.6x the AI performance of the Nvidia A100.
              </p>
            </div>
          </div>

          {/* Marvell Section */}
          <div className="space-y-6 pt-8 border-t border-zinc-800">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium text-white">Marvell</h3>
              <p className="text-lg text-zinc-300 leading-relaxed">
                Marvell creates custom chips (ASICs) that power AWS Trainium and Inferentia, specializing in optimizing the Memory Interface with HBM. Their custom design increases memory capacity by 33% and cuts power by 70% compared to standard off-the-shelf designs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-3 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                <div className="h-1 w-16 bg-[#D1623C] rounded-full"></div>
                <h4 className="text-lg font-medium text-[#D1623C]">Custom Compute</h4>
                <p className="text-zinc-300 text-sm leading-relaxed">The "Build-Your-Own" Platform. Marvell sells IP blocks so tech giants like Amazon and Google can write their own stories, creating custom ASICs that power AWS Trainium and Inferentia.</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-3 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                <div className="h-1 w-16 bg-[#D1623C] rounded-full"></div>
                <h4 className="text-lg font-medium text-[#D1623C]">Nova & Spica</h4>
                <p className="text-zinc-300 text-sm leading-relaxed">Optical DSPs that translate electrical signals into light signals. Nova enables 1.6 Terabits per second of data transfer, allowing AI clusters to span across entire buildings.</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-3 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                <div className="h-1 w-16 bg-[#D1623C] rounded-full"></div>
                <h4 className="text-lg font-medium text-[#D1623C]">Teralynx</h4>
                <p className="text-zinc-300 text-sm leading-relaxed">Specialized Ethernet switch for AI with "high radix" connectivity. It "flattens" the network, allowing data to reach destinations in 1-2 jumps instead of 5.</p>
              </div>
            </div>
          </div>

          {/* Tachyum Section */}
          <div className="space-y-6 pt-8 border-t border-zinc-800">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium text-white">Tachyum - Prodigy</h3>
              <p className="text-lg text-zinc-300 leading-relaxed">
                The world's first Universal Processor, unifying the functionality of a CPU, a GPU, and a TPU into a single monolithic chip. Every core on a Prodigy chip is capable of running standard applications and high-performance AI math, dynamically switching between these modes in nanoseconds.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-3">
              <h4 className="text-lg font-medium text-[#D1623C]">Homogeneous Calculation</h4>
              <p className="text-zinc-300 leading-relaxed">
                Unlike heterogeneous systems where data must move between CPU and GPU over PCIe, Prodigy's unified execution eliminates data movement overhead. Because the CPU and Matrix/Vector unit share the same memory, there is zero data movement overhead. Tachyum claims this approach delivers up to 10x lower power consumption and 3x lower Total Cost of Ownership compared to standard CPU+GPU setups.
              </p>
            </div>
          </div>
        </section>

        {/* Domain-Specific Accelerators Section */}
        <section className="space-y-8 pt-8 border-t border-zinc-800">
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white tracking-[-0.01em]">
              Domain-Specific <span className="text-[#D1623C]">Accelerators</span>
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
          </div>


          {/* Google TPU Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium text-white">Google - TPUs (Tensor Processing Unit)</h3>
              <p className="text-lg text-zinc-300 leading-relaxed">
                TPUs achieve much better energy efficiency than conventional chips, achieving "30x to 80x improvement in TOPS/Watt measure." The technical shift from Instruction-based (GPU) to Systolic Array (TPU) eliminates the Von Neumann bottleneck by loading data all at once and letting it flow through the array like a tsunami.
              </p>
            </div>

            {/* Google TPU Architecture Image */}
            <div className="relative w-full aspect-video bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden group hover:border-[#D1623C]/50 transition-all shadow-2xl">
              <img 
                src="/google-chip1.webp" 
                alt="Google TPU Architecture and Design"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ imageRendering: 'crisp-edges', filter: 'contrast(1.15) brightness(1.08) saturate(1.1)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h5 className="text-sm font-medium text-white mb-1">Google TPU Architecture</h5>
                <p className="text-xs text-zinc-400">Systolic array design for tensor processing</p>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-3 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-[#D1623C]">TPU v2/v3</h4>
                  <span className="text-xs text-zinc-500 px-2 py-1 bg-zinc-800/50 rounded">Legacy</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">Static 2D Mesh. Early TPUs connected in a rigid grid. V2 and V3 had to pass data through EVERYONE between, causing traffic jams.</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-3 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-[#D1623C]">TPU v4 + OCS</h4>
                  <span className="text-xs text-[#D1623C] px-2 py-1 bg-[#D1623C]/10 rounded">Current</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">Optical Circuit Switching uses MEMS mirrors. Software can physically reconfigure the room layout in milliseconds, forming rings or torus topologies as needed.</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-3 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-[#D1623C]">Trillium (v6)</h4>
                  <span className="text-xs text-[#D1623C] px-2 py-1 bg-[#D1623C]/10 rounded">Latest</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">Massive increase in HBM and ICI bandwidth. Like giving every chef a countertop twice as large and moving ingredients twice as fast.</p>
              </div>
              <div className="group p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-3 hover:border-[#D1623C]/50 hover:shadow-lg hover:shadow-[#D1623C]/10 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-[#D1623C]">Ironwood</h4>
                  <span className="text-xs text-[#D1623C] px-2 py-1 bg-[#D1623C]/10 rounded">Inference</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">Designed for inference. Massive 192 GB HBM capacity allows holding entire conversation context in short-term memory, eliminating wait time during AI's "thought process."</p>
              </div>
            </div>
          </div>

          {/* Groq Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Groq - LPU</h3>
            
            {/* Groq LPU Image */}
            <div className="relative w-full aspect-video bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden group hover:border-[#D1623C]/50 transition-all shadow-2xl">
              <img 
                src="/grok.jpg" 
                alt="Groq LPU Architecture and Technology"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ imageRendering: 'crisp-edges', filter: 'contrast(1.12) brightness(1.06) saturate(1.05)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h5 className="text-sm font-medium text-white mb-1">Groq LPU</h5>
                <p className="text-xs text-zinc-400">Language Processing Unit for deterministic inference</p>
              </div>
            </div>

            <div className="mt-6 p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-4 hover:border-[#D1623C]/30 transition-all">
              <p className="text-zinc-300 leading-relaxed text-sm">
                Highly energy efficient for inference. LPUs achieve high degree of determinism by eliminating contention for critical resources. They plan the movement of every single electron before the program even starts, knowing exactly where every piece of data will be at every nanosecond.
              </p>
              <div className="p-4 bg-gradient-to-r from-[#D1623C]/10 to-transparent border-l-4 border-[#D1623C] rounded-lg mt-4">
                <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                  <div className="h-1 w-8 bg-[#D1623C] rounded-full"></div>
                  Key Features
                </h5>
                <ul className="space-y-3 text-zinc-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#D1623C] mt-1">•</span>
                    <span><span className="font-medium text-[#D1623C]">Assembly Line Architecture:</span> High bandwidth connector between chips allows data to flow like a designated pre-cleared track from start to finish.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D1623C] mt-1">•</span>
                    <span><span className="font-medium text-[#D1623C]">Deterministic Executions:</span> LPUs look at the entire model and calculations to generate equations in advance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D1623C] mt-1">•</span>
                    <span><span className="font-medium text-[#D1623C]">On-Chip SRAM:</span> 230 mb internal SRAM eliminates back and forth data migration that wastes space and energy.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Intel Gaudi Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Intel - Habana Gaudi</h3>
            
            <div className="mt-6 p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-4 hover:border-[#D1623C]/30 transition-all">
              <p className="text-zinc-300 leading-relaxed text-sm">
                The series first came from an acquisition of Israeli startup Habana Labs in 2019. As a dedicated ASIC-like AI accelerator, it integrates Ethernet ports directly onto the chip, allowing you to connect thousands of them together cheaply using standard cables, avoiding expensive proprietary switches.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 border-l-2 border-[#D1623C]/50 rounded-r hover:bg-zinc-900/60 transition-colors">
                  <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                    <span className="text-[#D1623C]">Gaudi 3</span>
                    <span className="text-xs text-zinc-500 px-2 py-0.5 bg-zinc-800/50 rounded">5nm</span>
                  </h5>
                  <p className="text-sm text-zinc-400 leading-relaxed">64 tensor cores, 128 GB HBM2e, 3.7 TB/s bandwidth. 1,835 TFLOPS FP8 performance similar to NVIDIA H100 but often outperforms in enterprise AI workloads.</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 border-l-2 border-zinc-700/50 rounded-r hover:bg-zinc-900/60 transition-colors">
                  <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                    <span>Gaudi 2</span>
                    <span className="text-xs text-zinc-500 px-2 py-0.5 bg-zinc-800/50 rounded">7nm</span>
                  </h5>
                  <p className="text-sm text-zinc-400 leading-relaxed">96GB HBM2e, 2.45 TB/s bandwidth. Often outperforms NVIDIA A100 and achieves near-parity with H100 in specific enterprise workloads.</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 border-l-2 border-zinc-700/50 rounded-r hover:bg-zinc-900/60 transition-colors">
                  <h5 className="font-medium text-white mb-2">Gaudi 1</h5>
                  <p className="text-sm text-zinc-400 leading-relaxed">Legacy architecture, mostly retired now but established the foundation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SambaNova Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">SambaNova - RDU (Reconfigurable Dataflow Unit)</h3>
            
            <div className="mt-6 p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-4 hover:border-[#D1623C]/30 transition-all">
              <p className="text-zinc-300 leading-relaxed text-sm">
                The "Shape-Shifting" Chip. Unlike a GPU with fixed structure, the RDU allows software to rewire the hardware. It's composed of PCUs (Pattern Compute Units) for math and PMUs (Pattern Memory Units) for short-term memory.
              </p>
              <div className="p-4 bg-gradient-to-r from-[#D1623C]/10 to-transparent border-l-4 border-[#D1623C] rounded-lg mt-4">
                <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                  <div className="h-1 w-8 bg-[#D1623C] rounded-full"></div>
                  SN40L: The "Infinite Context" Engine
                </h5>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Built specifically to solve the "Memory Wall" for massive LLMs. Integrates three layers of memory: On-chip SRAM (ultra-fast), HBM (high bandwidth), and High-Capacity DDR (Terabytes). This allows holding massive models (5 Trillion+ parameters) or massive context windows on a single node.
                </p>
              </div>
            </div>
          </div>

          {/* AWS Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">AWS - Trainium & Inferentia</h3>
            
            <div className="mt-6 p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800/50 rounded-xl space-y-4 hover:border-[#D1623C]/30 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 border-l-4 border-[#D1623C] rounded-lg hover:bg-zinc-900/60 transition-colors">
                  <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                    <div className="h-1 w-8 bg-[#D1623C] rounded-full"></div>
                    Inferentia
                  </h5>
                  <p className="text-zinc-300 text-sm mb-3 leading-relaxed">Cost optimizer for running models. Achieves up to 70% lower cost per inference than traditional GPUs.</p>
                  <ul className="text-zinc-400 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#D1623C] mt-0.5">•</span>
                      <span><span className="font-medium text-zinc-300">Inf1:</span> Strictly for inference, high throughput for small models at lowest cost</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D1623C] mt-0.5">•</span>
                      <span><span className="font-medium text-zinc-300">Inf2:</span> Built for LLMs, chips communicate via NeuronLink, can split models across multiple chips</span>
                    </li>
                  </ul>
                </div>
                <div className="p-5 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 border-l-4 border-[#D1623C] rounded-lg hover:bg-zinc-900/60 transition-colors">
                  <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                    <div className="h-1 w-8 bg-[#D1623C] rounded-full"></div>
                    Trainium
                  </h5>
                  <p className="text-zinc-300 text-sm mb-3 leading-relaxed">Powerhouse for building models. Relies on systolic arrays like Google's TPU.</p>
                  <ul className="text-zinc-400 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#D1623C] mt-0.5">•</span>
                      <span><span className="font-medium text-zinc-300">Trn1:</span> Designed to replace GPUs in training</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D1623C] mt-0.5">•</span>
                      <span><span className="font-medium text-zinc-300">Trn2:</span> Built for UltraClusters with up to 100,000 chips connected via EFA (petabit-scale network)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Cerebras Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Cerebras - WSE (Wafer-Scale Engine)</h3>
            
            {/* Cerebras Wafer-Scale Image */}
            <div className="relative w-full aspect-video bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden group hover:border-[#D1623C]/50 transition-all shadow-2xl">
              <img 
                src="/cerebras.avif" 
                alt="Cerebras Wafer-Scale Engine Architecture"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ imageRendering: 'crisp-edges', filter: 'contrast(1.15) brightness(1.08) saturate(1.1)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h5 className="text-sm font-medium text-white mb-1">Cerebras Wafer-Scale Engine</h5>
                <p className="text-xs text-zinc-400">WSE-3: 850,000 cores on single wafer-scale chip</p>
              </div>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Fastest inference time on the market. Cerebras keeps the entire wafer intact—a single chip the size of a dinner plate compared to traditional GPU size of approximately a thumbnail. The 850,000 cores reside on the same piece of silicon and communicate instantly through "scribe lines."
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">WSE-1 & WSE-2</h5>
                  <p className="text-sm text-zinc-400">Traditional wafer-scale integration. Massive single-chip design with 850,000 cores.</p>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">WSE-3</h5>
                  <p className="text-sm text-zinc-400">4 trillion transistors. Redundant routing architecture with spare cores (1.5% extra) that can electronically "patch over" defects.</p>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">MemoryX & SwarmX</h5>
                  <p className="text-sm text-zinc-400">MemoryX holds up to 1.2 petabytes. SwarmX provides high-bandwidth connection for weight streaming, allowing single system to handle models with trillions of parameters.</p>
                </div>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <p className="text-zinc-300 text-sm">
                  <span className="font-medium text-white">CS-3 Performance:</span> 125 petaflops of AI compute using FP16 precision. A single CS-3 equates to about 3.5 DGX B200 servers, but with half the power consumption and dramatically simpler programming model.
                </p>
              </div>
            </div>
          </div>

          {/* Graphcore Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Graphcore - IPU (Intelligence Processing Unit)</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-2">Colossus MK1 (GC2) & MK2 (GC200)</h5>
                  <p className="text-zinc-300 text-sm mb-2">MIMD architecture (Multiple Instruction Multiple Data) vs GPUs' SIMD. GC200 contains 1,472 independent processor tiles, each with its own memory, capable of executing unique programs simultaneously.</p>
                  <p className="text-zinc-400 text-sm">900MB SRAM inside processor, 47.5 TB/s aggregate on-chip memory bandwidth. Exchange Memory allows swapping with up to 450GB external DDR4.</p>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-2">Bow IPU</h5>
                  <p className="text-zinc-300 text-sm mb-2">First high-volume semiconductor to utilize Wafer-on-Wafer (WoW) 3D stacking technology. Memory and logic stacked vertically, drastically reducing physical distance data must travel.</p>
                  <p className="text-zinc-400 text-sm">3D WoW technology allows lower voltage operation while achieving 40% higher performance, resulting in up to 16% better power efficiency.</p>
                </div>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <p className="text-zinc-300 text-sm">
                  <span className="font-medium text-white">IPU-Fabric & BSP:</span> Proprietary IPU-Fabric interconnect allows 64,000 IPUs to act as a single machine. Bulk Synchronous Parallel (BSP) execution model divides operations into local computation, global synchronization, and data exchange phases.
                </p>
              </div>
            </div>
          </div>

          {/* Huawei Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Huawei - Ascend</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Built on the Da Vinci architecture, which integrates three specific units: a 3D Cube core for matrix multiplications, a vector unit for general calculation, and a scalar unit for control flow.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">Ascend 910B</h5>
                  <p className="text-sm text-zinc-400">Manufactured on domestic 7nm-class process (SMIC N+1), achieves 320 teraflops of FP16 performance.</p>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">Ascend 910C</h5>
                  <p className="text-sm text-zinc-400">Dual-die "chiplet" design to overcome manufacturing limitations, effectively stitching two processors together to approach NVIDIA H100 performance.</p>
                </div>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <p className="text-zinc-300 text-sm">
                  <span className="font-medium text-white">CloudMatrix 384:</span> Connects 384 Ascend 910C processors into a single logical supernode using Unified Bus (UB) interconnect. Creates massive all-to-all mesh where data flows directly between any chips without hierarchical switches.
                </p>
              </div>
            </div>
          </div>

          {/* Furiosa AI Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Furiosa AI</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                High performance and energy-efficiency NPU for inference. Focused on "sustainable" AI with environmental necessity of energy efficiency and economic imperative of reducing TCO for hyperscale computing.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">Warboy</h5>
                  <p className="text-sm text-zinc-400">First-generation vision NPU, Samsung 14nm. 64 TOP (INT8), 40W-60W TDP. Designed for object detection, traffic management, industrial safety.</p>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">RNGD (Renegade)</h5>
                  <p className="text-sm text-zinc-400">TSMC 5nm, 512 TFLOPS FP8 and 512 TOPS INT8. 1.5 TB/s HBM3 bandwidth, 150W-180W TDP. Utilizes tensor contraction rather than matrix multiplication as primary computational unit.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Microsoft Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Microsoft Azure - Maia 100</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Microsoft's first-generation custom AI accelerator, specifically purpose-built to run Azure's largest internal workloads like OpenAI's GPT models and GitHub Copilot. Fabricated on TSMC 5nm process with 105 billion transistors.
              </p>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <p className="text-zinc-300 text-sm">
                  <span className="font-medium text-white">Key Features:</span> Specialized tensor unit optimized for "microscaling" (MX) data formats (MXINT8, MXFP4). Sidecar liquid cooling system allows high-density racks in existing data centers. Ethernet-centric interconnect strategy with 12 ports of 400 Gigabit Ethernet per chip, enabling 4800 Gbps backend network bandwidth.
                </p>
              </div>
            </div>
          </div>

          {/* Meta Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Meta - MTIA v2</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Composed of an 8x8 grid of 64 independent Processing Elements (PEs). Each PE features two RISC-V cores alongside fixed-function units like Dot Product Engine (DPE) for matrix multiplication. TSMC 5nm, 421 mm², 708 TFLOPS (INT8 with sparsity) at 90W TDP.
              </p>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <p className="text-zinc-300 text-sm">
                  <span className="font-medium text-white">Memory Hierarchy:</span> 128GB LPDDR5 DRAM (204.8 GB/s) with 256MB on-chip shared SRAM (2.7 TB/s bandwidth). Explicitly optimized for Deep Learning Recommendation Models (DLRMs), unsuitable for training LLMs or decoding large transformers due to bandwidth limitations.
                </p>
              </div>
            </div>
          </div>

          {/* Etched Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Etched - Soho</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Transformer ASIC hardwired exclusively for the Transformer architecture. Bakes the attention mechanism and matrix multiplications directly into the silicon. Can achieve 20x higher throughput than NVIDIA H100 for Transformer inference, processing over 500,000 tokens per second on Llama-3 70B.
              </p>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <p className="text-zinc-300 text-sm">
                  <span className="font-medium text-white">Scaling Promise:</span> Single 8-chip Soho server can replace 160 NVIDIA H100 GPUs. 144GB HBM3E memory. Designed for "infinite" batch sizes, can process thousands of concurrent users on a single chip.
                </p>
              </div>
            </div>
          </div>

          {/* d-Matrix Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">d-Matrix - Corsair</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Digital In-Memory Compute (DIMC) architecture integrates multipliers directly into memory bit-cells. Multi-chiplet design with 16 chiplets and all-to-all connectivity. Peak dense compute of up to 9,600 TFLOPs (MXINT4) per card.
              </p>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <p className="text-zinc-300 text-sm">
                  <span className="font-medium text-white">Three-Tier Memory:</span> 2GB on-chip SRAM delivering 150 TB/s bandwidth, up to 256GB off-chip LPDDR5 for model weights. DMX Link interconnect allows seamless scale-out from single PCIe card to entire rack.
                </p>
              </div>
            </div>
          </div>

          {/* Tenstorrent Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Tenstorrent - Wormhole</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Led by legendary chip architect Jim Keller. The Wormhole architecture centers on Tensix cores—modular compute units that decouple data movement from computation. Each Tensix core contains five specialized RISC-V processors.
              </p>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <p className="text-zinc-300 text-sm">
                  <span className="font-medium text-white">Key Features:</span> High-bandwidth 2D toroidal Network-on-Chip (NoC) treats entire chip as single large memory space. Uses GDDR6 (24GB on n300) instead of HBM for better performance-per-dollar. Entirely open-source stack (TT-Forge and TT-Metalium). Can scale into "Galaxy" mesh where rack of 32-128 chips acts as single unified processor.
                </p>
              </div>
            </div>
          </div>

          {/* Other ASICs */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Other ASICs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                <h4 className="text-lg font-medium text-[#D1623C]">Fractile</h4>
                <p className="text-zinc-300 text-sm">In-Memory Compute Interleaving. Physically interleaves memory and compute units at granular level. Promise: 25x speed increase and 90% cost reduction compared to GPU clusters.</p>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                <h4 className="text-lg font-medium text-[#D1623C]">NextSilicon - Maverick2</h4>
                <p className="text-zinc-300 text-sm">Intelligent Compute Architecture (ICA). Software-defined hardware that "learns" application behavior in real-time. 192GB HBM3E, code-agnostic supporting C/C++, Fortran, OpenMP.</p>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                <h4 className="text-lg font-medium text-[#D1623C]">Rebellions - Rebel</h4>
                <p className="text-zinc-300 text-sm">4-homogeneous-chiplet SoC on UCIe-Advanced. 2,048 TFLOPS (FP8), 144GB HBM3E, 4.8TB/s bandwidth. Predictive DMA reduces token-level latency by 50% vs H200.</p>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                <h4 className="text-lg font-medium text-[#D1623C]">Axelera AI - Titania</h4>
                <p className="text-zinc-300 text-sm">Digital In-Memory Computing for edge AI. Four Titania cores per Metis chip. 15 TOPS/W performance-to-power ratio. Optimized for INT8 and INT4 precision.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Emerging Physics-Based & Experimental Compute Section */}
        <section className="space-y-8 pt-8 border-t border-zinc-800">
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white tracking-[-0.01em]">
              Emerging Physics-Based & <span className="text-[#D1623C]">Experimental Compute</span>
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
          </div>

          {/* Photonic Processors */}
          <div className="space-y-6">
            <h3 className="text-2xl font-medium text-white">Photonic Processors</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <h4 className="text-lg font-medium text-[#D1623C]">Q.ANT</h4>
              <p className="text-zinc-300 leading-relaxed">
                Uses light (photons) instead of electricity (electrons) to perform calculations. The Q.ANT Native Processing Unit (NPU) performs math physically—by passing light through a specially shaped circuit, the math happens "in-flight." A Fourier Transform that takes millions of digital operations on a GPU happens instantly as light passes through a single optical waveguide.
              </p>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <p className="text-zinc-300 text-sm">
                  <span className="font-medium text-white">LNOI (Lithium Niobate on Insulator):</span> Allows Q.ANT to "steer" and "modulate" light with extreme precision, enabling 16-bit floating-point precision. Claims 30x better energy efficiency and 50x higher performance for specific workloads compared to top-tier GPUs.
                </p>
              </div>
            </div>
          </div>

          {/* Analog Compute */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Analog Compute</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                <h4 className="text-lg font-medium text-[#D1623C]">Vaire - Ice River</h4>
                <p className="text-zinc-300 text-sm">Reversible computing using adiabatic switching. Energy-recovery factor of 1.77 for capacitor arrays. Operates at 500 MHz (target 1 GHz). Eliminates hardware-level requirement for heat dissipation.</p>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                <h4 className="text-lg font-medium text-[#D1623C]">Mythic - M2000</h4>
                <p className="text-zinc-300 text-sm">Analog Flash Matrix Processing. Integrates computation directly into NOR flash memory array. Represents neural network weights as analog electrical charges. M1076 provided 25 TOPS at 3-4W; M2000 scales by order of magnitude.</p>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                <h4 className="text-lg font-medium text-[#D1623C]">Alibaba - ACCEL</h4>
                <p className="text-zinc-300 text-sm">Photonic-Electronic Hybrid Computing. Dual-tier: diffractive optical computing for feature extraction (passive, near-zero energy) + analog electronic computing for logic. 4.6 PFLOPS, 3,000x faster than A100 in specific image recognition tasks.</p>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                <h4 className="text-lg font-medium text-[#D1623C]">Irreversible Inc</h4>
                <p className="text-zinc-300 text-sm">"Minimum Viable Intelligence" chip for edge devices (&lt;1W). Uses analog dimmer switch approach instead of digital on/off. In-Memory Computing reduces power by claimed 1,000x vs GPUs. Non-Volatile Memory (Memristors) stores information even when power is off.</p>
              </div>
            </div>
          </div>

          {/* Neuromorphic Compute */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Neuromorphic Compute</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                <h4 className="text-lg font-medium text-[#D1623C]">IBM - NorthPole</h4>
                <p className="text-zinc-300 text-sm mb-2">Distributes memory across all 256 cores. Each core has its own local memory and computing unit, so "thinking" and "remembering" happen in the same spot. Uses Network-on-Chip similar to white matter connecting brain regions.</p>
                <p className="text-zinc-400 text-sm">25x more energy efficient than V100, 5x more efficient than H100. 22x lower latency. Inference only, 224 MB internal memory limit.</p>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                <h4 className="text-lg font-medium text-[#D1623C]">Applied Brain Research - TSP1</h4>
                <p className="text-zinc-300 text-sm mb-2">Legendre Memory Unit (LMU) accelerator. State-space model inference. Can represent information across 100,000+ time-steps using fewer internal state variables than RNNs or Transformers.</p>
                <p className="text-zinc-400 text-sm">Full-vocabulary speech-to-text and NLP in under 30mW. 10-100x more energy-efficient than standard edge GPUs.</p>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                <h4 className="text-lg font-medium text-[#D1623C]">Greatsky</h4>
                <p className="text-zinc-300 text-sm mb-2">Superconducting & Photonic Hybrid Architecture. Physical neurons from superconducting Josephson junctions. Multi-planar photonic waveguide system for communication.</p>
                <p className="text-zinc-400 text-sm">Claims potentially 4 million times more energy-efficient and 2 million times faster than NVIDIA GPU clusters. 30-year roadmap for exponential growth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Reconfigurable Hardware Section */}
        <section className="space-y-8 pt-8 border-t border-zinc-800">
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white tracking-[-0.01em]">
              Reconfigurable <span className="text-[#D1623C]">Hardware</span>
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
          </div>

          {/* Edge FPGAs */}
          <div className="space-y-6">
            <h3 className="text-2xl font-medium text-white">Edge FPGAs</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <h4 className="text-lg font-medium text-[#D1623C]">What makes an FPGA an "Edge" FPGA?</h4>
              <p className="text-zinc-300 leading-relaxed">
                An FPGA first of all compared to GPUs and ASICS are extremely flexible. FPGAs are known for their efficient flexibility, particularly in custom, low-latency applications. In deep learning use cases, FPGAs are valued for their versatility, power efficiency and adaptability. An Edge FPGA is shrunk down. It sacrifices some raw size for efficiency. Essentially, they're reconfigurable chip designed to sit in small, power-constrained devices (like drones, cameras, or factory robots).
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-300 ml-4">
                <li><span className="font-medium text-white">Power:</span> It runs on &lt;10 Watts (often &lt;1 Watt), so it can run on a battery or without a cooling fan.</li>
                <li><span className="font-medium text-white">Size:</span> It fits on a chip smaller than a postage stamp.</li>
                <li><span className="font-medium text-white">Connectivity:</span> It has specialized ports for cameras (MIPI) and sensors, because its main job is to "see" and "sense" the real world.</li>
              </ul>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <h4 className="text-lg font-medium text-[#D1623C]">Why use an Edge FPGA over an Edge GPU?</h4>
              <p className="text-zinc-300 leading-relaxed">
                If GPUs are easier to use, why would anyone use an FPGA?
              </p>
              <div className="space-y-3 mt-4">
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-2">"Streaming" Latency (The Factory Line)</h5>
                  <ul className="space-y-2 text-zinc-300 text-sm">
                    <li><span className="font-medium text-[#D1623C]">GPU:</span> Works in "Batches." It waits to collect 10 images, processes them all at once, and sends them back. This introduces a slight delay. (High throughput (moves lots of people), but high latency (the first person has to wait for the bus to fill).)</li>
                    <li><span className="font-medium text-[#D1623C]">FPGA:</span> Works in "Streams." As the pixel data comes in from the camera wire, it flows through the FPGA logic like water through a pipe. The processing happens in transit. (Deterministic Latency. You know exactly how many nanoseconds it will take. This is critical for Robotics (balancing a robot) or Autonomous Cars (braking).</li>
                  </ul>
                </div>
              </div>
              <p className="text-zinc-300 leading-relaxed mt-4">
                If Edge FPGAs are so great (low power, instant speed), why doesn't everyone use them? Because they are incredibly hard to program.
              </p>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <p className="text-zinc-300 text-sm space-y-2">
                  <span>To use a Jetson (GPU), you write Python.</span><br/>
                  <span>To use an Agilex (FPGA), you traditionally write Verilog/VHDL (hardware description languages). You have to manually tell the electricity where to flow.</span><br/>
                  <span className="font-medium text-white">Heronic's Value:</span> Their mosaIC tool allows a software engineer to say "I want to run this AI model," and the software automatically writes the Verilog to configure the FPGA. They are trying to make FPGAs as easy to use as GPUs.
                </p>
              </div>
            </div>
          </div>

          {/* Heronic.ai */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Heronic.ai</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <h4 className="text-lg font-medium text-[#D1623C]">The Concept</h4>
              <p className="text-zinc-300 leading-relaxed">
                Designing a custom chip usually takes a team of human engineers months or years. Heronic replaces that team with software. mosaIC is an AI toolflow that automatically designs the hardware architecture based on your specific needs.
              </p>
              <div className="space-y-3 mt-4">
                <p className="text-zinc-300"><span className="font-medium text-white">How it works:</span> You feed it three things:</p>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300 ml-4">
                  <li><span className="font-medium text-white">The AI Model:</span> (e.g., "I need to run YOLOv8 for object detection").</li>
                  <li><span className="font-medium text-white">The Hardware Platform:</span> (e.g., "I am using an AMD or Altera FPGA").</li>
                  <li><span className="font-medium text-white">The Objective:</span> (e.g., "I need lowest latency" or "I need max throughput").</li>
                </ol>
                <p className="text-zinc-300 mt-4">
                  <span className="font-medium text-white">The Result:</span> The software "compiles" a custom hardware architecture that is perfectly shaped for that specific neural network. It essentially writes the blueprint for you.
                </p>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <h5 className="font-medium text-white mb-2">Bespoke Accelerators (The "Perfect Fit"): High-Occupancy Hardware</h5>
                <p className="text-zinc-300 text-sm space-y-2">
                  <span><span className="font-medium">The Problem:</span> Standard GPUs are "generalists." They have thousands of cores, but for small, fast tasks (Edge AI), most of those cores sit idle waiting for data. Heronic notes that most AI hardware runs at &lt;10% efficiency (MAC occupancy) for edge apps.</span><br/>
                  <span><span className="font-medium">The Heronic Solution:</span> Because their hardware is custom-built for the exact model you are running, it uses every part of the chip.</span><br/>
                  <span className="ml-4 block mt-2"><span className="font-medium">Metric:</span> They claim 54% MAC Occupancy (5x higher than standard) and &lt;1 ms inference time (microsecond latency).</span><br/>
                  <span><span className="font-medium">Why it matters:</span> This allows cheaper, lower-power FPGAs to beat expensive GPUs. They claim 7x better performance than Edge GPUs for object detection tasks.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Efficient Computer */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Efficient Computer</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Efficient Computer is a pioneering startup in the Reconfigurable Hardware and Domain-Specific Accelerator categories. Led by CEO Brandon Lucia, the company is shaking up the "edge" compute market with a radical departure from the traditional way chips process instructions.
              </p>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <h4 className="font-medium text-white mb-2">Company and Product Overview</h4>
                <p className="text-zinc-300 text-sm">
                  Efficient Computer emerged from Carnegie Mellon University research to solve the "Energy Crisis" of AI at the edge. Their flagship product, the Electron E1 chip, is designed for applications where battery life is the primary constraint, such as space systems, industrial sensors, and defense. It claims to be 100x more efficient than leading low-power CPUs and 1,000x lower power than current GPUs.
                </p>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <h4 className="font-medium text-white mb-2">Compute Topology: The "Fabric" Spatial Dataflow</h4>
                <p className="text-zinc-300 text-sm space-y-2">
                  The defining feature of Efficient Computer is its Fabric architecture, which replaces the traditional "Step-by-Step" (Von Neumann) processing with a Spatial Dataflow model.
                </p>
                <ul className="list-disc list-inside space-y-2 text-zinc-300 text-sm mt-3 ml-4">
                  <li><span className="font-medium text-white">Instruction-less Execution:</span> Traditional CPUs spend massive amounts of energy just fetching and decoding instructions from memory. Efficient's Fabric eliminates this. It uses an array of computing "tiles" where instructions are assigned once by a compiler and then stay there.</li>
                  <li><span className="font-medium text-white">The "Old Phone System" Interconnect:</span> The tiles are connected by a circuit-switched network-on-chip. Instead of sending data in "packets" (like the modern internet), it sets up a direct "physical" path between tiles. Once the connection is open, data simply flows from one operation directly into the next downstream task.</li>
                  <li><span className="font-medium text-white">Distributed Doneness:</span> The chip doesn't use a global clock to sync everything. Instead, it uses a "distributed doneness" algorithm—tasks run the instant their inputs arrive, like a line of falling dominoes.</li>
                </ul>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <h4 className="font-medium text-white mb-2">Differentiation: Flexibility vs. Efficiency</h4>
                <p className="text-zinc-300 text-sm space-y-2">
                  The "Holy Grail" of chip design is achieving the speed of a custom ASIC with the flexibility of a CPU.
                </p>
                <ul className="list-disc list-inside space-y-2 text-zinc-300 text-sm mt-3 ml-4">
                  <li><span className="font-medium text-white">The Hybrid Play:</span> Efficient claims to have the efficiency of a dedicated accelerator (like a chip that only does one thing) but the programmability of a general-purpose CPU.</li>
                  <li><span className="font-medium text-white">Software-First:</span> Because it's a spatial architecture, the Efficient Compiler is the real star. It takes standard code (C, C++, or AI frameworks) and physically "maps" it onto the Fabric grid, deciding which tiles should handle which part of the math to minimize data travel.</li>
                </ul>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <h4 className="font-medium text-white mb-2">Energy Efficiency Lens: "Adiabatic" Switching</h4>
                <p className="text-zinc-300 text-sm space-y-2">
                  While the architecture is digital, Efficient uses a technique called Adiabatic Switching.
                </p>
                <ul className="list-disc list-inside space-y-2 text-zinc-300 text-sm mt-3 ml-4">
                  <li><span className="font-medium text-white">Energy Recycling:</span> Instead of electricity flowing from the power supply and turning into waste heat, the chip "pushes" energy in to change a state and then "pulls" it back out to reuse it.</li>
                  <li><span className="font-medium text-white">Result:</span> It achieves up to 1 TOPS/W (Tera-Operation Per Watt) at a scale of hundreds of microwatts. This allows devices to run for years on a single battery instead of weeks.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-24 pt-16 pb-12 border-t border-zinc-800">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-12">
          {/* RCVC Logo */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {/* Gradient background behind logo */}
              <div className="absolute inset-0 -inset-2 rounded-lg bg-gradient-to-br from-zinc-800/80 via-zinc-800/60 to-zinc-900/80 blur-sm"></div>
              <div className="absolute inset-0 -inset-1 rounded-lg bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
              <img 
                src="/image.png" 
                alt="RCVC Logo" 
                className="relative h-12 md:h-16 w-auto opacity-100 hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="h-12 w-px bg-zinc-700"></div>
            <div className="font-mono text-xs text-zinc-400 uppercase tracking-[0.2em] space-y-1 text-left">
              <p className="text-white font-medium">Rotman Commerce Venture Capital</p>
              <p className="text-zinc-500">Venture Research Group</p>
            </div>
          </div>
          
          {/* Center - For ArcTern Ventures */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-mono text-zinc-400 uppercase tracking-[0.3em] text-center">
              Prepared for
            </p>
            <p className="text-lg font-light text-white tracking-wide">
              ArcTern Ventures
            </p>
          </div>

          {/* Right - Document Info */}
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-[0.2em] text-center lg:text-right space-y-1">
            <p>RCVC-2026-ALPHA-INTEL</p>
            <p className="text-zinc-600">Confidential</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};
