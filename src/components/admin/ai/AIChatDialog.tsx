'use client'

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AIChatDialog({ open, setOpen }: AIChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, setOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Chyba při komunikaci s AI');
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chyba při odesílání zprávy:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Omlouváme se, ale došlo k chybě při komunikaci s AI. Zkuste to prosím znovu.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!open) return null;

  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label="Zavřít AI chat"
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-999 backdrop-blur-sm transition-all duration-200"
      style={{
        animation: 'fadeInBackdrop 0.2s ease-out forwards',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
          e.preventDefault();
          setOpen(false);
        }
      }}
    >
      <div
        className="transition-all duration-200 ease-out opacity-0 scale-95"
        style={{
          animation: 'cmdkFadeIn 0.2s cubic-bezier(0.4,0,0.2,1) forwards',
        }}
      >
        <div className="bg-white/95 border border-zinc-200/50 backdrop-blur-md rounded-xl shadow-xl w-[600px] h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200/50">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-sm font-medium text-zinc-900">AI Asistent</h2>
                <p className="text-xs text-zinc-500">Pomohu vám s navigací a příkazy</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                >
                  Vymazat
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-zinc-500 text-sm py-8">
                <Bot className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                <p>Ahoj! Jsem AI asistent pro Plexus.</p>
                <p>Můžu vám pomoci s navigací, příkazy a funkcemi dashboardu.</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 text-zinc-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-zinc-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 text-zinc-900 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI přemýšlí...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-zinc-200/50 p-4">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Napište zprávu..."
                className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cmdkFadeIn {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(-10px);
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
