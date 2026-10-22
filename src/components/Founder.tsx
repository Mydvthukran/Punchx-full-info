import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, ArrowRight, ExternalLink, Copy, Check, Printer, 
  ChevronRight, Globe, Users, Building2, Award, 
  MapPin, CheckCircle2, Linkedin, Briefcase, Share2
} from 'lucide-react';
import { AppScreen } from '../types';
import PUNCHX_LOGO from '../assets/logo';

interface FounderProps {
  onTransition: (target: AppScreen) => void;
  showNotification?: (msg: string) => void;
}

export default function Founder({ onTransition, showNotification }: FounderProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Official SEO Document Title & Description
    const previousTitle = document.title;
    document.title = "PunchX Founders — Rimil Das & Abhradip Ghosh";
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Meta description tag
    let metaDesc = document.querySelector("meta[name='description']") as HTMLMetaElement;
    const previousDesc = metaDesc ? metaDesc.content : null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Meet the PunchX founders: Rimil Das, Founder & COO, and Abhradip Ghosh, Co-Founder & CEO. Discover the leadership team behind PunchX (www.punchxapp.co.in).";

    // Canonical link tag update/insertion
    let canonicalTag = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    const previousCanonical = canonicalTag ? canonicalTag.href : null;
    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.rel = "canonical";
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = "https://www.punchxapp.co.in/founder";

    // Open Graph Title & Description
    let ogTitle = document.querySelector("meta[property='og:title']") as HTMLMetaElement;
    const prevOgTitle = ogTitle ? ogTitle.content : null;
    if (ogTitle) ogTitle.content = "PunchX Founders — Rimil Das & Abhradip Ghosh";

    let ogDesc = document.querySelector("meta[property='og:description']") as HTMLMetaElement;
    const prevOgDesc = ogDesc ? ogDesc.content : null;
    if (ogDesc) ogDesc.content = "Meet the PunchX founders: Rimil Das, Founder & COO, and Abhradip Ghosh, Co-Founder & CEO. Learn about PunchX leadership.";

    let ogUrl = document.querySelector("meta[property='og:url']") as HTMLMetaElement;
    const prevOgUrl = ogUrl ? ogUrl.content : null;
    if (ogUrl) ogUrl.content = "https://www.punchxapp.co.in/founder";

    // 2. Structured Data (JSON-LD) for Schema.org Search Engine Understanding
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://www.punchxapp.co.in/#organization",
          "name": "PunchX",
          "url": "https://www.punchxapp.co.in/",
          "logo": "https://www.punchxapp.co.in/favicon.jpg",
          "description": "PunchX is an on-demand service platform connecting users with verified technicians and specialists across Kolkata, India.",
          "founder": {
            "@type": "Person",
            "@id": "https://www.punchxapp.co.in/founder#rimil-das",
            "name": "Rimil Das",
            "jobTitle": "Founder & COO",
            "url": "https://www.linkedin.com/in/rimil-das-a0537a3ba/",
            "sameAs": [
              "https://www.linkedin.com/in/rimil-das-a0537a3ba/"
            ],
            "worksFor": {
              "@id": "https://www.punchxapp.co.in/#organization"
            }
          },
          "member": [
            {
              "@type": "Person",
              "@id": "https://www.punchxapp.co.in/founder#rimil-das",
              "name": "Rimil Das",
              "jobTitle": "Founder & COO",
              "url": "https://www.linkedin.com/in/rimil-das-a0537a3ba/",
              "sameAs": [
                "https://www.linkedin.com/in/rimil-das-a0537a3ba/"
              ]
            },
            {
              "@type": "Person",
              "@id": "https://www.punchxapp.co.in/founder#abhradip-ghosh",
              "name": "Abhradip Ghosh",
              "jobTitle": "Co-Founder & CEO",
              "url": "https://www.linkedin.com/in/abhradip-ghosh-858383404/",
              "sameAs": [
                "https://www.linkedin.com/in/abhradip-ghosh-858383404/"
              ]
            }
          ]
        },
        {
          "@type": "Person",
          "@id": "https://www.punchxapp.co.in/founder#rimil-das",
          "name": "Rimil Das",
          "jobTitle": "Founder & COO",
          "worksFor": {
            "@id": "https://www.punchxapp.co.in/#organization"
          },
          "url": "https://www.linkedin.com/in/rimil-das-a0537a3ba/",
          "sameAs": [
            "https://www.linkedin.com/in/rimil-das-a0537a3ba/"
          ],
          "description": "Rimil Das is the Founder & COO of PunchX, responsible for operations, platform governance, and specialist service delivery."
        },
        {
          "@type": "Person",
          "@id": "https://www.punchxapp.co.in/founder#abhradip-ghosh",
          "name": "Abhradip Ghosh",
          "jobTitle": "Co-Founder & CEO",
          "worksFor": {
            "@id": "https://www.punchxapp.co.in/#organization"
          },
          "url": "https://www.linkedin.com/in/abhradip-ghosh-858383404/",
          "sameAs": [
            "https://www.linkedin.com/in/abhradip-ghosh-858383404/"
          ],
          "description": "Abhradip Ghosh is the Co-Founder & CEO of PunchX, leading corporate strategy, product vision, and platform growth."
        }
      ]
    };

    let scriptTag = document.getElementById("punchx-founder-jsonld") as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "punchx-founder-jsonld";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      document.title = previousTitle;
      if (metaDesc && previousDesc) metaDesc.content = previousDesc;
      if (canonicalTag && previousCanonical) canonicalTag.href = previousCanonical;
      if (ogTitle && prevOgTitle) ogTitle.content = prevOgTitle;
      if (ogDesc && prevOgDesc) ogDesc.content = prevOgDesc;
      if (ogUrl && prevOgUrl) ogUrl.content = prevOgUrl;
      if (scriptTag) scriptTag.remove();
    };
  }, []);

  const handleCopyLink = () => {
    const url = "https://www.punchxapp.co.in/founder";
    navigator.clipboard.writeText(url);
    setCopied(true);
    if (showNotification) showNotification("✓ Founder page URL copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
      <style>{`
        #punchx-founder-leadership-page {
          background: radial-gradient(ellipse at 8% 0%, rgba(185,154,98,.12), transparent 34%), radial-gradient(ellipse at 96% 22%, rgba(255,255,255,.035), transparent 28%), linear-gradient(160deg, #171612 0%, #11110f 48%, #191813 100%) !important;
          color: #f2eee5 !important;
          font-family: Inter, Montserrat, ui-sans-serif, system-ui, sans-serif;
        }
        #punchx-founder-leadership-page h1, #punchx-founder-leadership-page h2, #punchx-founder-leadership-page h3 { letter-spacing: -.035em; }
        #punchx-founder-leadership-page article, #punchx-founder-leadership-page header { animation: founder-rise-in .65s cubic-bezier(.2,.7,.2,1) both; }
        #punchx-founder-leadership-page article:nth-of-type(2) { animation-delay: .08s; }
        #punchx-founder-leadership-page a, #punchx-founder-leadership-page button { -webkit-tap-highlight-color: transparent; }
        #punchx-founder-leadership-page button:focus-visible, #punchx-founder-leadership-page a:focus-visible { outline: 2px solid #e7d4a7; outline-offset: 3px; }
        #punchx-founder-leadership-page article { backdrop-filter: blur(10px); }
        @keyframes founder-rise-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { #punchx-founder-leadership-page article, #punchx-founder-leadership-page header { animation: none !important; } #punchx-founder-leadership-page * { scroll-behavior: auto !important; transition-duration: .01ms !important; } }
      `}</style>
    <div id="punchx-founder-leadership-page" className="min-h-screen bg-[#11110F] text-[#F2EEE5] py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#B99A62]/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
          <button 
            onClick={() => onTransition('home')}
            className="hover:text-[#E7D4A7] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-500">Company</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#E7D4A7] font-bold">Founders &amp; Leadership</span>
        </nav>

        {/* Hero Header Card */}
        <header className="relative rounded-3xl bg-gradient-to-b from-[#28251F] via-[#191815] to-[#11110F] border border-[#B99A62]/40 p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B99A62]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B99A62]/15 border border-[#B99A62]/30 text-[#E7D4A7] text-xs font-mono font-bold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E7D4A7]" />
                <span>OFFICIAL LEADERSHIP DIRECTORY</span>
              </div>
              
              {/* Primary H1 Heading for Search Engines & Visitors */}
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                PunchX Founders
              </h1>

              <div className="text-sm sm:text-base font-mono text-[#E7D4A7] font-bold flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span>Rimil Das — Founder &amp; COO</span>
                <span className="hidden sm:inline text-zinc-500">•</span>
                <span>Abhradip Ghosh — Co-Founder &amp; CEO</span>
              </div>
              
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                PunchX was founded by <strong>Rimil Das</strong> (Founder &amp; COO) and co-founded by <strong>Abhradip Ghosh</strong> (Co-Founder &amp; CEO). Meet the people building PunchX, a local-services marketplace focused on making it easier to discover and request professionals.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Globe className="w-3.5 h-3.5 text-[#B99A62]" />
                  Official Website: <strong className="text-white">www.punchxapp.co.in</strong>
                </span>
                <span className="hidden sm:inline text-zinc-600">•</span>
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 text-[#B99A62]" />
                  Headquarters: <strong className="text-white">Kolkata, West Bengal, India</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-[#24221D] hover:bg-[#343027] border border-[#B99A62]/30 text-xs font-semibold text-[#E7D4A7] flex items-center gap-2 transition-all cursor-pointer shadow-md"
                title="Share or Copy Profile Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#B99A62]" />}
                <span>{copied ? "Copied!" : "Share Profile"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-[#1A1915] hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-2 transition-all cursor-pointer shadow-md"
                title="Print or Save Page"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Print</span>
              </button>

              <button
                onClick={() => onTransition('home')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B99A62] to-[#E7D4A7] hover:from-[#E7D4A7] hover:to-[#B99A62] text-black font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <span>Explore PunchX</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Founding Team Section */}
        <section id="founding-team-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#B99A62]" />
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  PunchX Founding Team
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                The people, projects, and operating principles behind PunchX.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#B99A62] bg-[#B99A62]/10 px-3 py-1 rounded-full border border-[#B99A62]/30 font-bold self-start sm:self-auto">
              2 Key Executives
            </span>
          </div>

          {/* Leadership Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Rimil Das (Founder & COO) */}
            <article 
              id="leader-rimil-das" 
              className="rounded-2xl bg-gradient-to-b from-[#1B1A16] to-[#11110F] border-2 border-[#B99A62]/50 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-[#B99A62] transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B99A62]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-5 relative z-10">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#B99A62]/20 border border-[#B99A62]/40 text-[#E7D4A7] text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Award className="w-3 h-3 text-[#B99A62]" />
                    FOUNDING TEAM
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">PunchX Leadership</span>
                </div>

                {/* Profile Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#302B20] to-[#1A1915] border-2 border-[#B99A62] flex items-center justify-center text-[#E7D4A7] font-bold text-2xl font-sans shadow-lg flex-shrink-0">
                    RD
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-[#E7D4A7] transition-colors">
                      Rimil Das — Founder &amp; COO of PunchX
                    </h3>
                    <div className="text-sm font-mono text-[#B99A62] font-bold">
                      Founder &amp; COO (Chief Operating Officer)
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                      <span>PunchX</span>
                    </div>
                  </div>
                </div>

                {/* Accurate Biography Text */}
                <div className="p-4 rounded-xl bg-[#13120F] border border-zinc-800/80 space-y-2">
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                    <strong>Rimil Das</strong> is the <strong>Founder and Chief Operating Officer (COO)</strong> of PunchX, responsible for helping build and operate the PunchX platform and its ecosystem.
                  </p>
                </div>

                {/* Role Highlights */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Core Focus &amp; Operations:
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B99A62] flex-shrink-0" />
                      <span>Operational execution and pan-city service ecosystem orchestration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B99A62] flex-shrink-0" />
                      <span>Quality governance, specialist standards, and on-demand dispatch scaling</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B99A62] flex-shrink-0" />
                      <span>Platform infrastructure development and customer trust architecture</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* LinkedIn Connect Button */}
              <div className="pt-6 mt-6 border-t border-zinc-800/80 relative z-10">
                <a
                  id="rimil-das-linkedin-btn"
                  href="https://www.linkedin.com/in/rimil-das-a0537a3ba/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#80663A] hover:bg-[#6A532F] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg cursor-pointer group/btn"
                >
                  <Linkedin className="w-4 h-4 fill-current" />
                  <span>Connect on LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </article>

            {/* Card 2: Abhradip Ghosh (Co-Founder & CEO) */}
            <article 
              id="leader-abhradip-ghosh" 
              className="rounded-2xl bg-gradient-to-b from-[#1B1A16] to-[#11110F] border-2 border-[#B99A62]/50 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-[#B99A62] transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B99A62]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-5 relative z-10">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#B99A62]/20 border border-[#B99A62]/40 text-[#E7D4A7] text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Award className="w-3 h-3 text-[#B99A62]" />
                    FOUNDING TEAM
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">PunchX Leadership</span>
                </div>

                {/* Profile Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#302B20] to-[#1A1915] border-2 border-[#B99A62] flex items-center justify-center text-[#E7D4A7] font-bold text-2xl font-sans shadow-lg flex-shrink-0">
                    AG
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-[#E7D4A7] transition-colors">
                      Abhradip Ghosh — Co-Founder &amp; CEO of PunchX
                    </h3>
                    <div className="text-sm font-mono text-[#B99A62] font-bold">
                      Co-Founder &amp; CEO (Chief Executive Officer)
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                      <span>PunchX</span>
                    </div>
                  </div>
                </div>

                {/* Accurate Biography Text */}
                <div className="p-4 rounded-xl bg-[#13120F] border border-zinc-800/80 space-y-2">
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                    <strong>Abhradip Ghosh</strong> is the <strong>Co-Founder and Chief Executive Officer (CEO)</strong> of PunchX, helping lead the company's vision, strategy, and growth.
                  </p>
                </div>

                {/* Role Highlights */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Core Focus &amp; Strategy:
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B99A62] flex-shrink-0" />
                      <span>Company vision, multi-year strategic roadmap, and market expansion</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B99A62] flex-shrink-0" />
                      <span>Product innovation, brand prestige development, and enterprise partnerships</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B99A62] flex-shrink-0" />
                      <span>Investor relations, governance, and long-term organizational growth</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* LinkedIn Connect Button */}
              <div className="pt-6 mt-6 border-t border-zinc-800/80 relative z-10">
                <a
                  id="abhradip-ghosh-linkedin-btn"
                  href="https://www.linkedin.com/in/abhradip-ghosh-858383404/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#80663A] hover:bg-[#6A532F] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg cursor-pointer group/btn"
                >
                  <Linkedin className="w-4 h-4 fill-current" />
                  <span>Connect on LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </article>

          </div>
        </section>

        <section id="founder-background" className="rounded-2xl bg-[#1A1915]/90 border border-zinc-800 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Founder Background, Skills &amp; Projects</h2>
            <p className="text-sm text-zinc-300 mt-2">The founding team combines startup operations, product development, frontend projects, and technology experimentation.</p>
          </div>
          <article id="rimil-das-background" className="space-y-3">
            <h3 className="text-lg font-bold text-white">Rimil Das — Founder &amp; COO</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">Rimil Das is a student entrepreneur and the Founder &amp; Chief Operating Officer of PunchX. His work at PunchX includes startup operations, product development, team coordination, technology and AI integration, partnerships, fundraising activities, market execution, and validating the service marketplace with customers and professionals.</p>
            <h4 className="text-sm font-semibold text-[#E7D4A7]">Areas of focus</h4>
            <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1">
              <li>Startup operations and product execution</li><li>Team coordination, partnerships and market development</li><li>Technology and AI integration for a local-services marketplace</li><li>Customer and professional validation</li>
            </ul>
            <p className="text-sm text-zinc-300">Education and interests: student; interested in software, smart technology and product building. No degree or graduation credential is claimed here.</p>
            <a href="https://www.linkedin.com/in/rimil-das-a0537a3ba/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-sky-300 underline underline-offset-4">Rimil Das on LinkedIn <ExternalLink className="w-3.5 h-3.5" /></a>
          </article>
          <div className="border-t border-zinc-800" />
          <article id="abhradip-ghosh-background" className="space-y-3">
            <h3 className="text-lg font-bold text-white">Abhradip Ghosh — Co-Founder &amp; CEO</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">Abhradip Ghosh is the Co-Founder &amp; CEO of PunchX and a student based in West Bengal. His project experience includes frontend development for a restaurant website, an online examination platform and a car-dealer delivery platform, alongside experimental work in computer vision and AI assistants.</p>
            <h4 className="text-sm font-semibold text-[#E7D4A7]">Education</h4>
            <p className="text-sm text-zinc-300">Completed Class 10 at Bethany School with 88.4% and currently studies at Narayani School, West Bengal, according to the information provided for his resume.</p>
            <h4 className="text-sm font-semibold text-[#E7D4A7]">Selected projects</h4>
            <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1">
              <li><strong>Autonomous vehicle (Expo competition):</strong> a project using computer vision for autonomous road navigation and object detection.</li>
              <li><strong>Ultron AI assistant:</strong> an AI smart-assistant project inspired by voice assistants such as Alexa.</li>
              <li><strong>Web projects:</strong> frontend work on a restaurant website, an online examination platform and a car-dealer delivery platform.</li>
            </ul>
            <h4 className="text-sm font-semibold text-[#E7D4A7]">Languages</h4>
            <p className="text-sm text-zinc-300">Bengali and English (fluent); Hindi (conversational).</p>
            <a href="https://www.linkedin.com/in/abhradip-ghosh-858383404/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-sky-300 underline underline-offset-4">Abhradip Ghosh on LinkedIn <ExternalLink className="w-3.5 h-3.5" /></a>
          </article>
          <p className="text-xs text-zinc-400 border-t border-zinc-800 pt-4">Founder photos can be added after the founders provide approved images. No unverified legal entity or registration number is claimed on this page.</p>
        </section>

        {/* Company Overview & Relationship Summary */}
        <section id="about-punchx-leadership-context" className="rounded-2xl bg-[#1A1915]/90 border border-zinc-800 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#B99A62]" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              About PunchX &amp; Leadership Governance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <div className="space-y-3">
              <p>
                <strong>PunchX</strong> is an on-demand service utility operating in Kolkata, West Bengal. The platform connects households with vetted master specialists across electrical maintenance, plumbing, AC repair, carpentry, and home care.
              </p>
              <p>
                As <strong>Founder &amp; COO, Rimil Das</strong> oversees operational performance, platform execution, specialist onboarding compliance, and rapid dispatch logistics to deliver consistent service excellence across all Kolkata sectors.
              </p>
            </div>

            <div className="space-y-3">
              <p>
                As <strong>Co-Founder &amp; CEO, Abhradip Ghosh</strong> directs the strategic direction, brand prestige standards, technological innovation, and scalable growth initiatives for the PunchX ecosystem.
              </p>
              <p>
                Together, the founding team maintains rigorous standards of transparency, background verification, transparent upfront pricing, and comprehensive 30-day service warranty protection.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#151410] border border-[#B99A62]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 border border-[#B99A62] flex-shrink-0">
                <img src={PUNCHX_LOGO} alt="PunchX Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-bold text-white">PunchX Official Entity &amp; Contact</p>
                <p className="text-zinc-400">Inquiries: businressguy@gmail.com • Website: www.punchxapp.co.in</p>
              </div>
            </div>

            <button
              onClick={() => onTransition('home')}
              className="px-4 py-2 rounded-xl bg-[#B99A62] hover:bg-[#E7D4A7] text-black font-extrabold text-xs transition-all cursor-pointer shadow whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              Book Verified Services
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
