import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Loader2, X, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';
import { ChatMessageItem } from '../components/ChatMessageItem';

export const ChatView: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String.split(',')[1]);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      image: imagePreview || undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    const currentImage = selectedImage;
    clearImage();

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found");
      
      const ai = new GoogleGenAI({ apiKey });
      const model = ai.models;

      const modelMsgId = Date.now() + 1;
      setMessages(prev => [...prev, {
        role: 'model',
        text: '',
        timestamp: modelMsgId,
        isStreaming: true
      }]);

      const parts: any[] = [];
      if (currentImage) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: currentImage
          }
        });
      }
      if (userMsg.text) {
        parts.push({ text: userMsg.text });
      }

      const result = await model.generateContentStream({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "你是 Mystic Mirror，一位智慧而神秘的 AI 導師。請用深邃的洞察力回答，語氣冷靜且略帶詩意。你專精於玄學、哲學和人生指引。請務必使用繁體中文回答所有問題。"
        },
        contents: {
          role: 'user',
          parts: parts
        }
      });

      let fullText = '';
      for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => prev.map(msg => 
            msg.timestamp === modelMsgId 
              ? { ...msg, text: fullText } 
              : msg
          ));
        }
      }
      
      setMessages(prev => prev.map(msg => 
        msg.timestamp === modelMsgId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));

    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: `迷霧遮蔽了我的視線... (錯誤: ${error.message})`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 opacity-60">
            <div className="w-20 h-20 bg-white border border-stone-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Sparkles className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-lg font-serif font-medium text-stone-600">向 Mystic Mirror 提問</p>
            <p className="text-sm">尋求指引，探索您的道路</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <ChatMessageItem key={idx} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex items-center gap-2 text-stone-400 pl-12">
             <Loader2 className="w-4 h-4 animate-spin" />
             <span className="text-xs font-serif italic">占卜中...</span>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FEFCE8] via-[#FEFCE8] to-transparent">
        <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-2xl shadow-lg p-3">
          {imagePreview && (
            <div className="relative w-16 h-16 mb-2 group ml-2">
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-lg border border-stone-200" />
              <button 
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-stone-200 text-stone-600 rounded-full p-1 hover:bg-stone-300 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-2">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-3 text-stone-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-colors"
               title="新增圖片"
             >
               <ImageIcon size={20} />
             </button>
             <input 
               type="file" 
               ref={fileInputRef}
               className="hidden" 
               accept="image/*"
               onChange={handleImageSelect}
             />

             <textarea
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="詢問關於您的命運..."
               className="flex-1 bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400 resize-none py-3 max-h-32"
               rows={1}
               style={{ minHeight: '44px' }}
             />

             <button 
               onClick={sendMessage}
               disabled={isLoading || (!input.trim() && !selectedImage)}
               className={`
                 p-3 rounded-xl flex items-center justify-center transition-all
                 ${isLoading || (!input.trim() && !selectedImage)
                   ? 'bg-stone-100 text-stone-300 cursor-not-allowed' 
                   : 'bg-stone-800 text-white hover:bg-stone-700 shadow-md'}
               `}
             >
               {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};