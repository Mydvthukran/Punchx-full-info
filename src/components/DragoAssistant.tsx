import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, X, Send, Bot, Volume2, Mic, Check } from 'lucide-react';
import { AppScreen } from '../types';

interface DragoAssistantProps {
  currentScreen: AppScreen;
  onAutoFillOtp?: (code: string) => void;
  onApplyPromo?: (code: string) => void;
  onAutoFillBooking?: () => void;
}

export default function DragoAssistant({
  currentScreen,
  onAutoFillOtp,
  onApplyPromo,
  onAutoFillBooking,
}: DragoAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'drago' | 'user'; text: string; action?: string; label?: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  // Load contextual welcome messages based on screen changes
  useEffect(() => {
    let welcomeText = '';
    let actionType: string | undefined;
    let actionLabel: string | undefined;

    switch (currentScreen) {
      case 'splash':
        welcomeText = "Greetings! I am DRAGO, your virtual assistant. Let's get started!";
        break;
      case 'otp':
        welcomeText = "Verification code received: '418292'. Tap below to auto-fill!";
        actionType = 'fill-otp';
        actionLabel = 'Auto-Fill OTP: 418292';
        break;
      case 'home':
        welcomeText = "System ready. Your active service person is on the way. You have 20% off! Need me to find top electricians or carpenters?";
        actionType = 'explore-services';
        actionLabel = 'Claim 20% Discount';
        break;
      case 'booking':
        welcomeText = "Describing repair? I can auto-generate a description. Tap below to write notes!";
        actionType = 'fill-booking';
        actionLabel = 'Generate damage report';
        break;
      case 'payment':
        welcomeText = "Apply secret promo code 'ELITE20' for ₹50 off! Tap below to apply.";
        actionType = 'apply-promo';
        actionLabel = 'Apply ELITE20 Code';
        break;
      case 'tracking':
        welcomeText = "Rajesh is driving now. Want me to message him or keep real-time tracking logs?";
        break;
      default:
        welcomeText = "I stand ready to help you. Tap any button to proceed.";
    }

    setIsTyping(true);
    const timer = setTimeout(() => {
      setMessages([
        { sender: 'drago', text: welcomeText, action: actionType, label: actionLabel }
      ]);
      setIsTyping(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentScreen]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const rawText = textToSend;
    setMessages((prev) => [...prev, { sender: 'user', text: rawText }]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking and reply
    setTimeout(() => {
      let replyText = "Understood. Adjusting parameters to suit your request.";
      let actionType: string | undefined;
      let actionLabel: string | undefined;

      const lower = rawText.toLowerCase();
      if (lower.includes('secret') || lower.includes('otp') || lower.includes('code')) {
        replyText = "OTP verification received. You're logged in.";
      } else if (lower.includes('discount') || lower.includes('promo') || lower.includes('off')) {
        replyText = "Coupon applied! Your service fee has been reduced by 20%.";
        if (onApplyPromo) onApplyPromo('ELITE20');
      } else if (lower.includes('rajesh') || lower.includes('electrician') || lower.includes('track')) {
        replyText = "Rajesh Kumar is on his way. GPS tracking indicates he is arriving in 8 minutes.";
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        replyText = "Hello! I am Drago, your virtual helper. I'm ready to assist you.";
      }

      setMessages((prev) => [...prev, { sender: 'drago', text: replyText, action: actionType, label: actionLabel }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleActionClick = (action: string) => {
    if (action === 'fill-otp' && onAutoFillOtp) {
      onAutoFillOtp('418292');
      setMessages((prev) => [
        ...prev,
        { sender: 'drago', text: "✓ OTP '418292' auto-filled." }
      ]);
    } else if (action === 'apply-promo' && onApplyPromo) {
      onApplyPromo('ELITE20');
      setMessages((prev) => [
        ...prev,
        { sender: 'drago', text: "✓ Promo 'ELITE20' applied successfully!" }
      ]);
    } else if (action === 'fill-booking' && onAutoFillBooking) {
      onAutoFillBooking();
      setMessages((prev) => [
        ...prev,
        { sender: 'drago', text: "✓ Generated issue description: 'AC unit short-circuited with smoke coming from compressor board. Needs priority circuit diagnosis.'" }
      ]);
    }
  };

  return (
    <div id="drago-assistant" className="fixed z-[99] bottom-24 right-5 md:right-8">
      {/* Drago Floating Pulsing Avatar with Outer Ring */}
      <motion.button
        id="drago-trigger-btn"
        className="relative group w-14 h-14 bg-gradient-to-tr from-[#c5a059] via-[#07122a] to-[#e9c176] rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(197,160,89,0.4)] border border-[#e9c176]/50 active:scale-95 duration-150"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
      >
        {/* Glow pulsing ring element */}
        <span className="absolute inset-0 rounded-full bg-[#c5a059]/30 blur-md group-hover:bg-[#c5a059]/50 transition-all duration-300 animate-pulse"></span>
        <Sparkles className="w-6 h-6 text-[#e9c176] relative z-10 animate-bounce" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e9c176] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#c5a059] text-[9px] font-bold text-[#07122a] items-center justify-center">AI</span>
        </span>
      </motion.button>

      {/* Interactive Drago Dashboard Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="drago-window"
            className="absolute bottom-16 right-0 w-[330px] md:w-[380px] bg-[#0c0f10]/95 border border-[#c5a059]/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          >
            {/* Header section with status light and design logo */}
            <div id="drago-header" className="p-4 bg-gradient-to-r from-[#1d2021] to-[#0c0f10] border-b border-[#c5a059]/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/40">
                  <Bot className="w-4 h-4 text-[#e9c176]" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-black animate-pulse"></span>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-[#e1e3e4] text-sm flex items-center gap-1">
                    DRAGO <span className="text-[9px] px-1 bg-[#c5a059]/20 text-[#e9c176] border border-[#c5a059]/40 rounded">V2.4</span>
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="voice-toggle-btn"
                  className={`p-1.5 rounded-full border transition-all ${voiceActive ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#e9c176] animate-pulse' : 'border-zinc-700 text-zinc-400 hover:text-white'}`}
                  title="Simulate Voice Mode"
                  onClick={() => setVoiceActive(!voiceActive)}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  id="close-drago-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Body panel */}
            <div id="drago-chat-body" className="p-4 h-[280px] overflow-y-auto space-y-3 custom-scrollbar flex flex-col">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed ${m.sender === 'user' ? 'bg-[#c5a059] text-black font-semibold rounded-tr-none' : 'bg-[#1d2021] text-[#e1e3e4] border border-[#c5a059]/20 rounded-tl-none'}`}
                  >
                    {m.text}
                  </div>
                  {/* Render Quick Actions inside Chat if applicable */}
                  {m.action && (
                    <button
                      id={`drago-action-${idx}`}
                      onClick={() => handleActionClick(m.action!)}
                      className="mt-2 text-[10px] px-3 py-1.5 bg-[#c5a059]/10 hover:bg-[#c5a059] text-[#e9c176] hover:text-[#07122a] border border-[#c5a059]/50 rounded-lg font-bold tracking-wider float-left self-start transition-all animate-pulse"
                    >
                      {m.label || m.action}
                    </button>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 py-1 text-xs text-zinc-500 font-mono">
                  <Bot className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>DRAGO is thinking...</span>
                </div>
              )}
            </div>

            {/* Simulated Voice Waveform overlay */}
            {voiceActive && (
              <div id="voice-waves" className="px-4 py-2 bg-[#c5a059]/5 border-t border-[#c5a059]/20 flex items-center justify-between gap-3 animate-fade-in">
                <span className="text-[10px] text-[#e9c176] font-mono animate-pulse">Voice Active</span>
                <div className="flex gap-1 items-center justify-center">
                  <span className="w-0.5 h-4 bg-[#c5a059] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-0.5 h-6 bg-[#e9c176] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-0.5 h-3 bg-[#c5a059] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  <span className="w-0.5 h-7 bg-[#e9c176] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  <span className="w-0.5 h-4 bg-[#c5a059] rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></span>
                </div>
              </div>
            )}

            {/* Quick Prompts list */}
            <div id="quick-actions-bar" className="px-4 py-2 border-t border-zinc-800 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth bg-[#121d3a]/25 whitespace-nowrap">
              <button
                id="prompt-status-btn"
                onClick={() => handleSendMessage("Where is Rajesh Kumar right now?")}
                className="text-[10px] px-2.5 py-1 bg-[#191c1d] hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-700 transition"
              >
                Where is Rajesh?
              </button>
              <button
                id="prompt-discount-btn"
                onClick={() => handleSendMessage("Can I get a discount or promo code?")}
                className="text-[10px] px-2.5 py-1 bg-[#191c1d] hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-700 transition"
              >
                Request Discount
              </button>
              <button
                id="prompt-verify-btn"
                className="text-[10px] px-2.5 py-1 bg-[#191c1d] hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-700 transition"
                onClick={() => handleSendMessage("Tell me about verified worker status")}
              >
                How are pros verified?
              </button>
            </div>

            {/* Input Footer Area */}
            <form
              id="drago-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-3 bg-[#111415] border-t border-zinc-800 flex items-center gap-2"
            >
              <input
                id="drago-message-input"
                type="text"
                placeholder="Ask DRAGO premium requests..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow bg-[#1d2021] border border-zinc-700 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-[#e1e3e4] placeholder-zinc-500 outline-none"
              />
              <button
                id="drago-send-btn"
                type="submit"
                className="p-2 bg-[#c5a059] hover:bg-[#e9c176] text-[#07122a] rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
