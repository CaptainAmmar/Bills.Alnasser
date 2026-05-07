import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { chatStream } from '../services/gemini';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const stream = await chatStream(input, messages);
      let fullResponse = '';
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].parts[0].text = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: 'System Error: Neural Link Severed. Please re-initiate.' }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden border-0">
      <div className="p-4 border-b border-nexus-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h2 className="text-sm font-mono uppercase tracking-widest text-nexus-muted">Neural Assistant</h2>
        </div>
        <div className="text-[10px] font-mono text-nexus-muted opacity-50 uppercase">v3.1.2-PREVIEW</div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <Bot className="w-12 h-12" />
            <p className="font-mono text-sm">System Ready. Awaiting Command.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-nexus-accent/20' : 'bg-white/5'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-nexus-accent" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-nexus-accent text-white' : 'bg-white/5 text-gray-300'
              }`}>
                {msg.parts[0].text}
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
             <div className="flex max-w-[85%] space-x-3">
              <div className="mt-1 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-white/5 text-xs font-mono text-nexus-muted animate-pulse">
                Synthesizing response...
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-nexus-border bg-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Neural query..."
            className="w-full bg-nexus-bg border border-nexus-border rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-nexus-accent transition-colors font-mono"
          />
          <button 
            type="submit"
            disabled={isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-nexus-muted hover:text-nexus-accent transition-colors disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
