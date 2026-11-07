import React, { useState, useRef } from 'react';
import { MessageSquare, Send, Bot, User, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import type { AssistantChatResponse } from '../types/finance.types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  delegatedAgent?: string;
  metrics?: Array<{ label: string; value: string | number }>;
  recommendations?: string[];
  suggestedFollowUps?: string[];
}

interface AssistantChatViewProps {
  onSendMessage: (query: string) => Promise<AssistantChatResponse>;
  isSending: boolean;
}

const getTimestamp = () => new Date().toLocaleTimeString();

export const AssistantChatView: React.FC<AssistantChatViewProps> = ({
  onSendMessage,
  isSending,
}) => {
  const msgCounter = useRef(1);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-initial',
      sender: 'assistant',
      text: 'Hello, I am your **AI Finance Assistant**. I coordinate our multi-agent autonomous team to monitor your cash reserves, audit expenses, detect spending anomalies, and forecast runway. How can I assist your business today?',
      timestamp: '10:00 AM',
      suggestedFollowUps: [
        'What is our current cash runway and burn rate?',
        'Are there any flagged spending anomalies in our recent ledger?',
        'How are our departmental budgets performing?',
        'Summarize our accounts payable and upcoming invoices',
      ],
    },
  ]);

  const [input, setInput] = useState('');

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isSending) return;

    msgCounter.current += 1;
    const currentId = `msg-${msgCounter.current}`;

    const userMsg: Message = {
      id: `${currentId}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: getTimestamp(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const response = await onSendMessage(textToSend);
      msgCounter.current += 1;
      const assistantMsg: Message = {
        id: `msg-${msgCounter.current}-assistant`,
        sender: 'assistant',
        text: response.answer,
        timestamp: getTimestamp(),
        delegatedAgent: response.delegatedAgent,
        metrics: response.metrics,
        recommendations: response.recommendations,
        suggestedFollowUps: response.suggestedFollowUps,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      msgCounter.current += 1;
      const errorMsg: Message = {
        id: `msg-${msgCounter.current}-error`,
        sender: 'assistant',
        text: `Error processing query: ${err instanceof Error ? err.message : 'Unknown communication error'}`,
        timestamp: getTimestamp(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-cyan-400" />
          AI Finance Assistant &amp; Autonomous Dispatch Console
        </h2>
        <p className="text-xs text-slate-400">
          Natural language interface coordinating the 5 specialized financial agents with live
          telemetry citation
        </p>
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col h-[650px] shadow-xl backdrop-blur-sm">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-2 scrollbar-thin">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 font-bold'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Speech Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-cyan-600 text-white rounded-tr-none'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    {!isUser && m.delegatedAgent && (
                      <div className="mb-2 flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono">
                        <Zap className="h-3 w-3" />
                        <span>Dispatched to: {m.delegatedAgent}</span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>

                  {/* Supporting Metrics Chips */}
                  {m.metrics && m.metrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {m.metrics.map((met, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                        >
                          <span className="text-[10px] text-slate-400 block">{met.label}</span>
                          <span className="font-bold text-white font-mono">{met.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
                      <span className="font-semibold text-amber-400 text-[11px] block mb-1">
                        Agent Recommendations:
                      </span>
                      <ul className="space-y-1">
                        {m.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up suggestions */}
                  {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestedFollowUps.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(prompt)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-[11px] text-slate-300 transition cursor-pointer flex items-center gap-1"
                        >
                          <span>{prompt}</span>
                          <ArrowRight className="h-3 w-3 text-cyan-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 font-mono px-1 block">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          {isSending && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span>AI Finance Assistant is orchestrating specialized agents...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about runway, anomalies, budgets, cash flow, or request reports..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
