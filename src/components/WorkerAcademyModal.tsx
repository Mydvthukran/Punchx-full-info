import React, { useState } from 'react';
import { Award, BookOpen, CheckCircle2, Play, Sparkles, X, ShieldCheck } from 'lucide-react';

interface WorkerAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification: (msg: string) => void;
}

export default function WorkerAcademyModal({
  isOpen,
  onClose,
  showNotification
}: WorkerAcademyModalProps) {
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({
    'mod-1': true,
  });

  if (!isOpen) return null;

  const courses = [
    {
      id: 'mod-1',
      title: 'High-Voltage Safety & Grounding Fundamentals',
      category: 'Safety Protocol',
      duration: '25 mins',
      scoreBoost: '+15% Dispatch Match',
      desc: 'Mastering earth leakage detection, RCCB testing, and 1000V insulated gloves usage.',
      modules: 4,
      badge: 'Certified Safety Master'
    },
    {
      id: 'mod-2',
      title: 'Smart Inverter AC Diagnostics & PCB Codes',
      category: 'Technical Mastery',
      duration: '40 mins',
      scoreBoost: '+25% Premium Jobs',
      desc: 'Deep-dive into BLDC compressor error decoding (E1, E6, F3), thermistor calibration, and micro-soldering.',
      modules: 6,
      badge: 'Inverter Specialist'
    },
    {
      id: 'mod-3',
      title: '5-Star Prestige Customer Etiquette & Hygiene',
      category: 'Customer Service',
      duration: '15 mins',
      scoreBoost: '+20% Repeat Customers',
      desc: 'Professional greeting, shoe cover protocol, transparent invoice walkthrough, and digital signature collection.',
      modules: 3,
      badge: '5-Star Hospitality'
    },
    {
      id: 'mod-4',
      title: 'Commercial Motorized Drain Snake Operation',
      category: 'Plumbing Guild',
      duration: '30 mins',
      scoreBoost: '+18% High-Value Jobs',
      desc: 'Safe deployment of high-torque flexible spiral cables for zero-damage concealed pipe unclogging.',
      modules: 5,
      badge: 'Hydraulic Master'
    }
  ];

  const handleCompleteCourse = (id: string, name: string) => {
    setCompletedModules(prev => ({ ...prev, [id]: true }));
    showNotification(`✓ Module completed! Earned certification badge: ${name}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#07122a] border border-[#c5a059]/40 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 bg-[#0a1736] border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#c5a059]/20 text-[#e9c176] border border-[#c5a059]/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059] font-bold">
                PUNCHX SPECIALIST ACADEMY
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                Skill Certifications & Ranking Boost
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-2xl bg-[#0d1c3e] border border-[#c5a059]/30 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#e9c176]" />
                Your Guild Ranking: Gold Specialist
              </span>
              <p className="text-[11px] text-zinc-400">
                Complete modules below to level up to <strong>Platinum Master (5% lower commission + priority radar dispatch)</strong>.
              </p>
            </div>

            <div className="text-right font-mono">
              <span className="text-xl font-bold text-[#e9c176]">
                {Object.values(completedModules).filter(Boolean).length} / {courses.length}
              </span>
              <span className="text-[10px] text-zinc-500 block">BADGES EARNED</span>
            </div>
          </div>

          {/* Courses List */}
          <div className="space-y-3">
            {courses.map((course) => {
              const isDone = !!completedModules[course.id];
              return (
                <div
                  key={course.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone 
                      ? 'bg-[#0a1836] border-emerald-500/40 shadow-sm' 
                      : 'bg-[#09152e] border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#e9c176] bg-[#c5a059]/10 px-2 py-0.5 rounded font-bold">
                        {course.category}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                        {course.scoreBoost}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">
                      {course.title}
                    </h4>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {course.desc}
                    </p>

                    <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-3 pt-1">
                      <span>⏱️ {course.duration}</span>
                      <span>•</span>
                      <span>📚 {course.modules} Interactive Lessons</span>
                      <span>•</span>
                      <span className="text-[#c5a059] font-bold">Badge: {course.badge}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 sm:text-right">
                    {isDone ? (
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>CERTIFIED</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCompleteCourse(course.id, course.badge)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#e9c176] text-black text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Play className="w-3 h-3 fill-black" />
                        <span>Start Course</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
