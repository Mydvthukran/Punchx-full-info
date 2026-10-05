import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { AppScreen } from '../types';
import { getAIResponse } from '../services/gemini';
import { decidePunchXIntent, PunchXIntent } from '../services/decisionRouter';

interface DragoAssistantProps {
  currentScreen: AppScreen;
  onAutoFillOtp?: (code: string) => void;
  onApplyPromo?: (code: string) => void;
  onAutoFillBooking?: () => void;
}

const intentLabels: Record<PunchXIntent, string> = {
  book_service: 'service booking',
  track_booking: 'booking tracking',
  payment_help: 'payment help',
  professional_help: 'professional information',
  general_help: 'general help',
};

export default function DragoAssistant({ currentScreen }: DragoAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'drago' | 'user'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const welcome: Record<string, string> = {
      splash: 'Welcome to PunchX. I am DRAGO, your AI assistant.',
      otp: 'I can help with sign-in. I cannot see, generate, or reveal your OTP. Use the code delivered by the official authentication flow.',
      home: 'Welcome to PunchX. Tell me what service you need and I can help you navigate the platform.',
      booking: 'I can help with your booking. Tell me what service you need or describe the problem.',
      payment: 'I can explain the PunchX payment flow. I will not invent payment details or discount codes.',
      tracking: 'I can help with tracking when live booking and location data is available. I will not invent a worker, location, or ETA.'
    };
    setMessages([{ sender: 'drago', text: welcome[currentScreen] || 'I am DRAGO, the PunchX assistant. How can I help?' }]);
  }, [currentScreen]);

  const sendMessage = async (value: string) => {
    const text = value.trim();
    if (!text || isTyping) return;
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputText('');
    setIsTyping(true);

    try {
      // Fast local/on-device semantic routing happens before the generative AI
      // call. On Chrome builds with the experimental Decisions API this uses
      // DecisionModel; otherwise the small deterministic fallback keeps today’s
      // PunchX production flow working.
      const decision = await decidePunchXIntent(text);

      if (decision.containsSensitiveData) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'drago',
            text: 'For your security, please remove phone numbers, email addresses, passwords, API keys, or other credentials before sending this message.',
          },
        ]);
        return;
      }

      if (decision.needsClarification) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'drago',
            text: 'I can help. Are you trying to book a service, track an existing booking, get payment help, or learn about a professional?',
          },
        ]);
        return;
      }

      // Keep the existing Gemini/DRAGO response layer, but give it a compact,
      // trusted intent signal instead of asking a generative model to classify
      // every request itself.
      const routedPrompt = `[PunchX intent: ${intentLabels[decision.intent]} | confidence: ${decision.confidence.toFixed(2)}] ${text}`;
      const response = await getAIResponse(routedPrompt);
      setMessages((prev) => [...prev, { sender: 'drago', text: response }]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'drago', text: 'DRAGO is temporarily unavailable. Please try again shortly.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div id="drago-assistant" className="fixed z-[99] bottom-24 right-5 md:right-8">
      <motion.button
        id="drago-trigger-btn"
        aria-label="Open DRAGO assistant"
        className="relative group w-14 h-14 bg-gradient-to-tr from-[#c5a059] via-[#07122a] to-[#e9c176] rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(197,160,89,0.4)] border border-[#e9c176]/50 active:scale-95"
        onClick={() => setIsOpen((open) => !open)}
        whileHover={{ scale: 1.05 }}
      >
        <span className="absolute inset-0 rounded-full bg-[#c5a059]/30 blur-md group-hover:bg-[#c5a059]/50 transition-all duration-300 animate-pulse" />
        <Sparkles className="w-6 h-6 text-[#e9c176] relative z-10" />
        <span className="absolute -top-1 -right-1 rounded-full h-4 w-4 bg-[#c5a059] text-[9px] font-bold text-[#07122a] flex items-center justify-center">AI</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="drago-window"
            className="absolute bottom-16 right-0 w-[min(92vw,380px)] bg-[#0c0f10]/95 border border-[#c5a059]/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
          >
            <div className="p-4 bg-gradient-to-r from-[#1d2021] to-[#0c0f10] border-b border-[#c5a059]/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/40">
                  <Bot className="w-4 h-4 text-[#e9c176]" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-black" />
                </div>
                <div>
                  <h3 className="font-bold text-[#e1e3e4] text-sm">DRAGO <span className="text-[9px] px-1 bg-[#c5a059]/20 text-[#e9c176] border border-[#c5a059]/40 rounded">AI</span></h3>
                  <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">PunchX Assistant</p>
                </div>
              </div>
              <button aria-label="Close DRAGO" onClick={() => setIsOpen(false)} className="p-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div id="drago-chat-body" className="p-4 h-[300px] overflow-y-auto space-y-3 flex flex-col">
              {messages.map((message, index) => (
                <div key={index} className={`flex max-w-[88%] ${message.sender === 'user' ? 'self-end' : 'self-start'}`}>
                  <div className={`p-3 rounded-xl text-xs leading-relaxed ${message.sender === 'user' ? 'bg-[#c5a059] text-black font-semibold rounded-tr-none' : 'bg-[#1d2021] text-[#e1e3e4] border border-[#c5a059]/20 rounded-tl-none'}`}>
                    {message.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="flex items-center gap-2 text-xs text-zinc-500"><Bot className="w-3.5 h-3.5 text-[#c5a059]" /> DRAGO is thinking...</div>}
            </div>

            <div className="px-4 py-2 border-t border-zinc-800 flex gap-1.5 overflow-x-auto no-scrollbar bg-[#121d3a]/25 whitespace-nowrap">
              <button onClick={() => void sendMessage('What services does PunchX provide?')} className="text-[10px] px-2.5 py-1 bg-[#191c1d] hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-700">PunchX services</button>
              <button onClick={() => void sendMessage('How are professionals verified on PunchX?')} className="text-[10px] px-2.5 py-1 bg-[#191c1d] hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-700">Professional verification</button>
              <button onClick={() => void sendMessage('How does booking work?')} className="text-[10px] px-2.5 py-1 bg-[#191c1d] hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-700">How booking works</button>
            </div>

            <form onSubmit={(event) => { event.preventDefault(); void sendMessage(inputText); }} className="p-3 bg-[#111415] border-t border-zinc-800 flex items-center gap-2">
              <input
                id="drago-message-input"
                type="text"
                placeholder="Ask DRAGO..."
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                disabled={isTyping}
                className="flex-grow bg-[#1d2021] border border-zinc-700 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-[#e1e3e4] placeholder-zinc-500 outline-none"
              />
              <button id="drago-send-btn" type="submit" disabled={isTyping || !inputText.trim()} className="p-2 bg-[#c5a059] disabled:opacity-50 text-[#07122a] rounded-xl active:scale-95">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
