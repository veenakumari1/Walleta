import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send } from 'lucide-react';
import type { AssistantChatResponse } from '../types/finance.types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  delegatedAgent?: string;
  metrics?: Array<{ label: string; value: string | number }>;
  recommendations?: string[];
  suggestedFollowUps?: string[];
}

interface AssistantChatViewProps {
  onSendMessage: (query: string) => Promise<AssistantChatResponse>;
  isSending: boolean;
}

export const AssistantChatView: React.FC<AssistantChatViewProps> = ({ onSendMessage, isSending }) => {
  const msgCounter = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-initial',
      sender: 'assistant',
      text: 'Hi! I can help with your cash, budgets, spending anomalies and invoices. What would you like to know?',
      suggestedFollowUps: [
        'What is our cash runway?',
        'Any flagged anomalies?',
        'How are budgets performing?',
        'Summarize upcoming invoices',
      ],
    },
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isSending) return;

    msgCounter.current += 1;
    const userMsg: Message = { id: `msg-${msgCounter.current}-user`, sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const response = await onSendMessage(textToSend);
      msgCounter.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${msgCounter.current}-assistant`,
          sender: 'assistant',
          text: response.answer,
          delegatedAgent: response.delegatedAgent,
          metrics: response.metrics,
          recommendations: response.recommendations,
          suggestedFollowUps: response.suggestedFollowUps,
        },
      ]);
    } catch (err) {
      msgCounter.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${msgCounter.current}-error`,
          sender: 'assistant',
          text: `Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}`,
        },
      ]);
    }
  };

  return (
    <div className="card flex flex-col" style={{ height: 'calc(100vh - 190px)', minHeight: 460 }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {!isUser && (
                <div className="h-9 w-9 rounded-xl grid place-items-center shrink-0 bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div className={`max-w-[75%] space-y-3 ${isUser ? 'items-end' : ''}`}>
                <div
                  className={`px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'text-white rounded-[20px_6px_20px_20px]'
                      : 'bg-white/[0.06] text-white/90 rounded-[6px_20px_20px_20px]'
                  }`}
                  style={isUser ? { background: 'linear-gradient(135deg, var(--accent-2), var(--accent))' } : undefined}
                >
                  {!isUser && m.delegatedAgent && (
                    <p className="text-[10px] uppercase tracking-wider text-[var(--accent-2)] mb-1.5">
                      via {m.delegatedAgent}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>

                {m.metrics && m.metrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {m.metrics.slice(0, 3).map((met, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-white/[0.05]">
                        <p className="text-[10px] text-white/50">{met.label}</p>
                        <p className="font-bold mt-0.5">{met.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {m.recommendations && m.recommendations.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-white/70 px-1">
                    {m.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                )}

                {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {m.suggestedFollowUps.slice(0, 4).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white hover:border-[var(--accent)] transition cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl grid place-items-center bg-[var(--accent-soft)] text-[var(--accent)] animate-pulse">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex gap-1.5 px-4 py-3 rounded-[6px_20px_20px_20px] bg-white/[0.06]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-[var(--accent)] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 pt-4 mt-4 border-t border-white/10"
      >
        <input
          type="text"
          placeholder="Ask anything about your finances..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          className="flex-1 px-5 py-3 text-sm text-white placeholder-white/30"
          style={{ borderRadius: 999 }}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="btn flex items-center gap-2"
          style={{ padding: '12px 22px' }}
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </form>
    </div>
  );
};
