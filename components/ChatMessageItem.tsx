import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { Sparkles, User } from 'lucide-react';

interface Props {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full gap-4 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border
        ${isUser ? 'bg-stone-800 border-stone-800 text-stone-50' : 'bg-white border-stone-200 text-yellow-600'}
      `}>
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>

      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isUser 
            ? 'bg-stone-800 text-stone-50 rounded-tr-none' 
            : 'bg-white text-stone-800 rounded-tl-none border border-stone-200'}
        `}>
          {message.image && (
            <img 
              src={message.image} 
              alt="Uploaded" 
              className="max-w-full rounded-lg mb-3 border border-stone-200" 
              style={{ maxHeight: '300px' }}
            />
          )}
          <div className="markdown-body">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        </div>
        <span className="text-xs text-stone-400 mt-1 px-1 font-serif">
          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
    </div>
  );
};