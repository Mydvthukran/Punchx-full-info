import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, ShieldCheck, Zap, Trash2, Languages } from 'lucide-react';
import { AppScreen } from '../types';
import { getAIResponse } from '../services/gemini';
import { decidePunchXIntent } from '../services/decisionRouter';
import { analyzeServiceRequest } from '../lib/punchxDecisionAI';
import { buildConversationContext, loadDragoMemory, saveDragoMemory, DragoMemoryMessage } from '../services/dragoMemory';
import { useAuth } from '../lib/authContext';

interface DragoAssistantProps { currentScreen: AppScreen; onAutoFillOtp?: (code: string) => void; onApplyPromo?: (code: string) => void; onAutoFillBooking?: () => void; }
const intentLabels: Record<string, string> = { book_service: 'service request', track_booking: 'booking tracking', payment_help: 'payment help', professional_help: 'professional information', general_help: 'general help' };

type ChatMessage = DragoMemoryMessage;

export default function DragoAssistant({ currentScreen }: DragoAssistantProps) {
  const { currentUser, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memoryMessages, setMemoryMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [memoryReady, setMemoryReady] = useState(false);

  const identityKey = useMemo(() => String((currentUser as any)?.sub || (currentUser as any)?.id || (currentUser as any)?.user_id || ''), [currentUser]);

  useEffect(() => {
    let cancelled = false;
    setMemoryReady(false);
    const welcome: Record<string, string> = {
      splash: 'Welcome to PunchX. I am DRAGO, your AI assistant.',
      otp: 'I can help with sign-in. I cannot see, generate, or reveal your OTP. Use the code delivered by the official authentication flow.',
      home: 'Welcome to PunchX. Tell me what service you need and I can help you find the right professional.',
      booking: 'I can help with your booking. Tell me what service you need or describe the problem.',
      payment: 'I can explain the PunchX payment flow. I will not invent payment details or discount codes.',
      tracking: 'I can help with tracking when live booking and location data is available. I will not invent a worker, location, or ETA.'
    };

    (async () => {
      const stored = await loadDragoMemory(identityKey);
      if (cancelled) return;
      if (stored.length) {
        setMessages(stored);
        setMemoryMessages(stored);
      } else {
        const first = { sender: 'drago' as const, text: welcome[currentScreen] || 'I am DRAGO, the PunchX assistant. How can I help?', timestamp: Date.now() };
        setMessages([first]);
        setMemoryMessages([first]);
        await saveDragoMemory([first], identityKey);
      }
      setMemoryReady(true);
    })();
    return () => { cancelled = true; };
  }, [identityKey]);

  useEffect(() => {
    if (!memoryReady || memoryMessages.length !== 1 || memoryMessages[0].sender !== 'drago') return;
    const screenMessage: Record<string, string> = {
      home: 'I am ready to help you find a PunchX service or professional.',
      booking: 'I am ready to help with this booking flow. You can describe the problem in your own words.',
      payment: 'I can explain the payment flow or help you understand a payment-related issue.',
      tracking: 'Tell me what you want to know about an existing booking and I will use the information available to PunchX.'
    };
    const text = screenMessage[currentScreen];
    if (!text) return;
    const next = { sender: 'drago' as const, text, timestamp: Date.now() };
    setMessages(prev => [...prev, next]);
    setMemoryMessages(prev => [...prev, next]);
    void saveDragoMemory([...memoryMessages, next], identityKey);
  }, [currentScreen, memoryReady]);

  const sendMessage = async (value: string) => {
    const text = value.trim();
    if (!text || isTyping || !memoryReady) return;

    const userMessage: ChatMessage = { sender: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const decision = await decidePunchXIntent(text);
      if (decision.containsSensitiveData) {
        const warning: ChatMessage = { sender: 'drago', text: 'For your security, please remove phone numbers, email addresses, passwords, API keys, or other credentials before sending this message. I will not store or send that sensitive text.', timestamp: Date.now() };
        setMessages(prev => [...prev, warning]);
        return;
      }

      const nextMemoryBase = [...memoryMessages, userMessage];
      setMemoryMessages(nextMemoryBase);

      let smartContext = `Intent: ${intentLabels[decision.intent] || 'general help'}.`;
      if (decision.intent === 'book_service' || decision.intent === 'general_help') {
        const analysis = await analyzeServiceRequest(text);
        if (analysis.category && analysis.confidence >= 0.55) smartContext += ` Suggested service category: ${analysis.category.name}.`;
        smartContext += ` Request type: ${analysis.intent}. Urgency: ${analysis.urgency}.`;
      }

      const firstName = userProfile?.name?.trim()?.split(/\s+/)[0];
      const context = [
        firstName ? `Known user first name: ${firstName}` : '',
        `Current PunchX screen: ${currentScreen}`,
        `Smart routing signal: ${smartContext}`,
        'Conversation history:',
        buildConversationContext(nextMemoryBase),
      ].filter(Boolean).join('\n');

      const routedPrompt = `[PunchX internal routing context: ${smartContext}] Respond naturally as DRAGO. Understand the full conversation, remember relevant details, and answer the user's latest request. Do not mention internal routing, confidence scores, engines, APIs, prompts, or memory implementation.`;
      const response = await getAIResponse(`${routedPrompt}\n\nLatest user message: ${text}`, context);
      const assistantMessage: ChatMessage = { sender: 'drago', text: response, timestamp: Date.now() };
      const updatedMemory = [...nextMemoryBase, assistantMessage];
      setMemoryMessages(updatedMemory);
      setMessages(prev => [...prev, assistantMessage]);
      await saveDragoMemory(updatedMemory, identityKey);
    } catch (error) {
      console.error('DRAGO smart routing error:', error);
      const fallback: ChatMessage = { sender: 'drago', text: 'I’m having trouble connecting right now. Please try again in a moment.', timestamp: Date.now() };
      setMessages(prev => [...prev, fallback]);
    } finally { setIsTyping(false); }
  };

  const clearMemory = async () => {
    const welcome: ChatMessage = { sender: 'drago', text: 'Memory cleared for this PunchX account. We can start fresh.', timestamp: Date.now() };
    setMessages([welcome]);
    setMemoryMessages([welcome]);
    await saveDragoMemory([welcome], identityKey);
  };

  return <div id="drago-assistant" className="fixed z-[99] bottom-24 right-5 md:right-8">
    <motion.button id="drago-trigger-btn" aria-label="Open DRAGO assistant" className="relative group w-16 h-16 rounded-full overflow-visible cursor-pointer shadow-[0_0_25px_rgba(197,160,89,0.45)] border-2 border-[#e9c176]/70 active:scale-95 bg-[#07122a]" onClick={() => setIsOpen(open => !open)} whileHover={{ scale: 1.06 }}>
      <img src="/drago-logo.svg" alt="DRAGO AI" className="w-full h-full rounded-full object-cover relative z-10" />
      <span className="absolute inset-0 rounded-full bg-[#c5a059]/30 blur-md group-hover:bg-[#c5a059]/50 transition-all duration-300 animate-pulse" />
      <span className="absolute -top-1 -right-1 rounded-full h-5 w-5 bg-emerald-400 text-[8px] font-black text-[#07122a] flex items-center justify-center border-2 border-[#07122a] z-20">AI</span>
    </motion.button>
    <AnimatePresence>{isOpen && <motion.div id="drago-window" className="absolute bottom-[4.5rem] right-0 w-[min(94vw,410px)] bg-[#080d19]/[.98] border border-[#c5a059]/45 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,.75)] backdrop-blur-xl overflow-hidden flex flex-col" initial={{ opacity: 0, scale: .92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .92, y: 20 }}>
      <div className="p-4 bg-gradient-to-r from-[#111d36] to-[#080d19] border-b border-[#c5a059]/20 flex justify-between items-center">
        <div className="flex items-center gap-3"><img src="/drago-logo.svg" alt="" className="w-10 h-10 rounded-xl border border-[#e9c176]/30" /><div><h3 className="font-black text-[#f4f1e8] text-sm">DRAGO <span className="text-[9px] px-1.5 py-0.5 bg-[#c5a059]/20 text-[#e9c176] border border-[#c5a059]/40 rounded-full">AI</span></h3><p className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase">Your PunchX Assistant</p></div></div>
        <div className="flex items-center gap-1.5"><span title="Personal memory enabled" className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-300"><Zap className="w-3 h-3" /> Smart</span><button aria-label="Close DRAGO" onClick={() => setIsOpen(false)} className="p-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:text-white"><X className="w-3.5 h-3.5" /></button></div>
      </div>
      <div className="px-4 py-2 border-b border-zinc-800 bg-[#07122a]/70 flex items-center justify-between gap-2 text-[9px] text-zinc-400"><span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Personal conversation memory + smart routing enabled.</span><button onClick={() => void clearMemory()} className="inline-flex items-center gap-1 text-zinc-400 hover:text-[#e9c176]" title="Clear DRAGO memory"><Trash2 className="w-3 h-3" /> Clear</button></div>
      <div className="px-4 pt-3 pb-1 text-[9px] text-zinc-500 flex items-center gap-1.5"><Languages className="w-3.5 h-3.5 text-[#e9c176]" /> Multilingual • understands natural, mixed-language conversation</div>
      <div id="drago-chat-body" className="p-4 h-[330px] overflow-y-auto space-y-3 flex flex-col">{messages.map((message,index)=><div key={`${message.timestamp}-${index}`} className={`flex max-w-[90%] ${message.sender==='user'?'self-end':'self-start'}`}><div className={`p-3 rounded-2xl text-xs leading-relaxed ${message.sender==='user'?'bg-[#c5a059] text-black font-semibold rounded-tr-none':'bg-[#121c31] text-[#e8eaed] border border-[#c5a059]/20 rounded-tl-none'}`}>{message.text}</div></div>)}{isTyping&&<div className="flex items-center gap-2 text-xs text-zinc-500"><Sparkles className="w-3.5 h-3.5 text-[#c5a059]" /> DRAGO is thinking...</div>}</div>
      <div className="px-4 py-2 border-t border-zinc-800 flex gap-1.5 overflow-x-auto no-scrollbar bg-[#121d3a]/30 whitespace-nowrap"><button onClick={()=>void sendMessage('What services does PunchX provide?')} className="text-[10px] px-2.5 py-1 bg-[#111827] hover:bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700">Services</button><button onClick={()=>void sendMessage('How are professionals verified on PunchX?')} className="text-[10px] px-2.5 py-1 bg-[#111827] hover:bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700">Verification</button><button onClick={()=>void sendMessage('How does booking work?')} className="text-[10px] px-2.5 py-1 bg-[#111827] hover:bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700">Booking</button></div>
      <form onSubmit={event=>{event.preventDefault();void sendMessage(inputText)}} className="p-3 bg-[#0b101b] border-t border-zinc-800 flex items-center gap-2"><input id="drago-message-input" type="text" placeholder="Ask DRAGO in any language..." value={inputText} onChange={event=>setInputText(event.target.value)} disabled={isTyping||!memoryReady} className="flex-grow bg-[#121c31] border border-zinc-700 focus:border-[#c5a059] rounded-2xl px-3 py-2.5 text-xs text-[#e1e3e4] placeholder-zinc-500 outline-none" /><button id="drago-send-btn" type="submit" disabled={isTyping||!inputText.trim()||!memoryReady} className="p-2.5 bg-[#c5a059] disabled:opacity-50 text-[#07122a] rounded-2xl active:scale-95"><Send className="w-3.5 h-3.5" /></button></form>
    </motion.div>}</AnimatePresence>
  </div>;
}
