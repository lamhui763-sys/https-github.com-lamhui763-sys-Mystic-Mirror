
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { Send, Loader2, X, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface Props {
  initialContext: string;
  onClose: () => void;
}

export const ChatDialog: React.FC<Props> = ({ initialContext, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const newChat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `你是一位專業的神祕學解讀助手。用戶剛剛閱讀了以下分析結果：\n\n"${initialContext}"\n\n請根據這個分析結果，回答用戶關於此結果的後續疑問。請保持專業、優雅且具啟發性的語氣，繁體中文回答。`,
        },
      });
      setChat(newChat);
    }
  }, [initialContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !chat || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '無法解讀您的疑問。' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: '對話發生錯誤，請稍後再試。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden border border-stone-200">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h3 className="font-serif font-bold text-stone-800 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-900" />
            解讀諮詢室
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
          {messages.length === 0 && (
            <div className="text-center text-stone-400 text-sm mt-10 font-serif italic">
              針對剛才的分析，有什麼想進一步了解的嗎？
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-900 text-white' : 'bg-white border border-stone-100 text-stone-700'}`}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl border border-stone-100 text-stone-400">
                <Loader2 className="animate-spin" size={16} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-stone-100 bg-white">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="輸入您的疑問..."
              className="flex-1 p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading}
              className="p-3 bg-indigo-900 text-white rounded-xl hover:bg-indigo-800 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
