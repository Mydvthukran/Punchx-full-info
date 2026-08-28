import React, { useEffect, useState } from 'react';
import { 
  Shield, ShieldCheck, Lock, FileText, ArrowLeft, ArrowRight, ExternalLink, 
  Copy, Check, Printer, ChevronRight, Mail, Globe, Users, CreditCard, 
  Smartphone, Database, AlertCircle, Building2, HelpCircle
} from 'lucide-react';
import { AppScreen } from '../types';
import PUNCHX_LOGO from '../assets/logo';

interface PrivacyPolicyProps {
  onTransition: (target: AppScreen) => void;
  showNotification?: (msg: string) => void;
}

export default function PrivacyPolicy({ onTransition, showNotification }: PrivacyPolicyProps) {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('section-1');

  useEffect(() => {
    // Set official SEO document title as requested
    const previousTitle = document.title;
    document.title = "PunchX Privacy Policy";
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Canonical link tag update/insertion
    let canonicalTag = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    const previousCanonical = canonicalTag ? canonicalTag.href : null;
    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.rel = "canonical";
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = "https://www.punchxapp.co.in/privacy-policy";

    return () => {
      document.title = previousTitle;
      if (canonicalTag && previousCanonical) {
        canonicalTag.href = previousCanonical;
      }
    };
  }, []);

  const handleCopyLink = () => {
    const url = "https://www.punchxapp.co.in/privacy-policy";
    navigator.clipboard.writeText(url);
    setCopied(true);
    if (showNotification) showNotification("✓ Privacy Policy link copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // offset for sticky navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const sections = [
    { id: 'section-1', num: '1', title: 'About PunchX' },
    { id: 'section-2', num: '2', title: 'Information We Collect' },
    { id: 'section-3', num: '3', title: 'How We Use Your Information' },
    { id: 'section-4', num: '4', title: 'Authentication' },
    { id: 'section-5', num: '5', title: 'Payments' },
    { id: 'section-6', num: '6', title: 'How We Share Information' },
    { id: 'section-7', num: '7', title: 'Ratings and Reviews' },
    { id: 'section-8', num: '8', title: 'Data Security' },
    { id: 'section-9', num: '9', title: 'Data Retention' },
    { id: 'section-10', num: '10', title: 'Your Rights and Choices' },
    { id: 'section-11', num: '11', title: "Children's and Young Users' Privacy" },
    { id: 'section-12', num: '12', title: 'Third-Party Services' },
    { id: 'section-13', num: '13', title: 'Changes to This Privacy Policy' },
    { id: 'section-14', num: '14', title: 'Contact Us' },
  ];

  return (
    <div id="punchx-privacy-policy-page" className="min-h-screen bg-[#07122a] text-[#e1e3e4] py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#c5a059]/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Breadcrumb Bar */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400 mb-6">
          <button 
            onClick={() => onTransition('home')}
            className="hover:text-[#e9c176] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-500">Legal</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#e9c176] font-bold">Privacy Policy</span>
        </nav>

        {/* Hero Header Card */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#0d1c3d] to-[#0a152e] border border-[#c5a059]/35 p-6 sm:p-10 mb-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] text-xs font-mono font-bold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e9c176]" />
                <span>OFFICIAL LEGAL DOCUMENTATION</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                PunchX Privacy Policy
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Effective Date: <strong className="text-white">27 August 2026</strong>
                </span>
                <span className="hidden sm:inline text-zinc-600">•</span>
                <span>Last Updated: <strong className="text-zinc-300">27 August 2026</strong></span>
                <span className="hidden sm:inline text-zinc-600">•</span>
                <span className="text-[#e9c176]">Production URL: https://www.punchxapp.co.in/privacy-policy</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-[#111f3d] hover:bg-[#182a52] border border-[#c5a059]/30 text-xs font-semibold text-[#e9c176] flex items-center gap-2 transition-all cursor-pointer shadow-md"
                title="Copy Privacy Policy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#c5a059]" />}
                <span>{copied ? "Copied!" : "Share URL"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-[#0a152e] hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-2 transition-all cursor-pointer shadow-md"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>

              <button
                onClick={() => {
                  onTransition('terms-and-conditions');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#e9c176] hover:from-[#e9c176] hover:to-[#c5a059] text-black font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <span>Terms & Conditions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Cross-Link Warning / Quick Switch Banner */}
        <div className="rounded-xl bg-[#0a152e] border border-zinc-800 p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-zinc-300">
            <FileText className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
            <span>Looking for the platform rules and agreements? Read our official <strong>Terms and Conditions</strong>.</span>
          </div>
          <button
            onClick={() => {
              onTransition('terms-and-conditions');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-[#e9c176] hover:text-white font-bold inline-flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0 underline decoration-[#c5a059]/40 underline-offset-4"
          >
            <span>View Terms & Conditions</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Two-Column Layout: Sticky Navigation Sidebar + Policy Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Table of Contents Sticky Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 rounded-2xl bg-[#0a152e] border border-zinc-800 p-5 shadow-lg space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-xs font-mono font-bold uppercase tracking-wider text-[#c5a059]">
                <Shield className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Table of Contents</span>
              </div>
              <ul className="space-y-1 text-xs">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <button
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                        activeSection === sec.id
                          ? 'bg-[#111f3d] text-[#e9c176] font-bold border-l-2 border-[#c5a059]'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-zinc-500">{sec.num}.</span>
                      <span className="truncate">{sec.title}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <div className="p-3 rounded-xl bg-[#071024] border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
                  <p className="font-bold text-white">PunchX Official Support</p>
                  <p className="text-zinc-400">Email: businressguy@gmail.com</p>
                  <p className="text-zinc-400">Web: www.punchxapp.co.in</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Legal Content */}
          <main className="lg:col-span-8 space-y-8">

            {/* Intro Card */}
            <div className="rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-white">Welcome to PunchX</h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Welcome to PunchX. We respect your privacy and are committed to handling your personal information responsibly.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                This Privacy Policy explains how PunchX collects, uses, stores, shares, and protects information when you use our website, mobile application, and related services.
              </p>
            </div>

            {/* Section 1 */}
            <section id="section-1" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  1
                </span>
                <h3 className="text-lg font-bold text-white">About PunchX</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PunchX is a startup technology platform that helps users find, connect with, and book workers or service providers for household and day-to-day service needs.
              </p>
              <p className="text-sm text-zinc-300 font-semibold">Our platform may be used by:</p>
              <ul className="space-y-2 text-sm text-zinc-300 pl-4 border-l-2 border-zinc-800">
                <li className="flex items-start gap-2">
                  <span className="text-[#c5a059] font-bold">•</span>
                  <span>Customers seeking household or daily-life services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c5a059] font-bold">•</span>
                  <span>Service providers or workers offering services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c5a059] font-bold">•</span>
                  <span>Administrators and authorised members of the PunchX team</span>
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  2
                </span>
                <h3 className="text-lg font-bold text-white">Information We Collect</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Depending on how you use PunchX, we may collect the following information.
              </p>

              {/* Subsection A */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-[#e9c176] flex items-center gap-2">
                  <span>A. Account and Profile Information</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                  <li className="p-2.5 rounded-lg bg-[#071024] border border-zinc-800/80">• Full name</li>
                  <li className="p-2.5 rounded-lg bg-[#071024] border border-zinc-800/80">• Email address</li>
                  <li className="p-2.5 rounded-lg bg-[#071024] border border-zinc-800/80">• Mobile or phone number</li>
                  <li className="p-2.5 rounded-lg bg-[#071024] border border-zinc-800/80">• Profile photograph, where provided</li>
                  <li className="p-2.5 rounded-lg bg-[#071024] border border-zinc-800/80">• Account and authentication identifiers</li>
                  <li className="p-2.5 rounded-lg bg-[#071024] border border-zinc-800/80">• User type, such as customer or service provider</li>
                  <li className="p-2.5 rounded-lg bg-[#071024] border border-zinc-800/80 sm:col-span-2">• Other profile information voluntarily provided by you</li>
                </ul>
              </div>

              {/* Subsection B */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-[#e9c176]">B. Service-Related Information</h4>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-300">For customers, we may collect:</p>
                  <ul className="space-y-1.5 text-xs text-zinc-400 pl-4 border-l border-zinc-800">
                    <li>• Service requirements</li>
                    <li>• Booking details</li>
                    <li>• Service address or location information where required</li>
                    <li>• Preferred date and time</li>
                    <li>• Communications relating to a service request</li>
                    <li>• Ratings and reviews</li>
                  </ul>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-zinc-300">For service providers, we may collect:</p>
                  <ul className="space-y-1.5 text-xs text-zinc-400 pl-4 border-l border-zinc-800">
                    <li>• Professional or service-related information</li>
                    <li>• Services offered</li>
                    <li>• Availability</li>
                    <li>• Service location or areas served</li>
                    <li>• Pricing or service information</li>
                    <li>• Verification information and documents where required</li>
                    <li>• Ratings, reviews, and booking history</li>
                  </ul>
                </div>
              </div>

              {/* Subsection C */}
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-bold text-[#e9c176]">C. Verification Information</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  To improve trust and safety on PunchX, we may collect information or documents from service providers for verification purposes.
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The exact verification requirements may change as our platform develops. We will use reasonable measures to protect verification information and will collect such information only for legitimate verification, safety, fraud-prevention, or legal purposes.
                </p>
              </div>

              {/* Subsection D */}
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-bold text-[#e9c176]">D. Payment and Transaction Information</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  When you make or receive payments through supported PunchX payment flows, payment processing may involve third-party payment service providers.
                </p>
                <p className="text-xs text-zinc-400">PunchX may receive or store information relating to transactions, such as:</p>
                <ul className="space-y-1 text-xs text-zinc-400 pl-4 border-l border-zinc-800">
                  <li>• Transaction identifiers</li>
                  <li>• Payment status</li>
                  <li>• Booking amount</li>
                  <li>• Refund information</li>
                  <li>• Other information necessary for managing transactions</li>
                </ul>
                <div className="p-3 rounded-xl bg-[#071024] border border-[#c5a059]/30 text-xs text-[#e9c176]">
                  PunchX does not intend to store complete sensitive payment card credentials when payments are processed by an authorised third-party payment processor.
                </div>
              </div>

              {/* Subsection E */}
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-bold text-[#e9c176]">E. Communications</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  We may collect information contained in communications made through PunchX, including:
                </p>
                <ul className="space-y-1 text-xs text-zinc-400 pl-4 border-l border-zinc-800">
                  <li>• In-app messages</li>
                  <li>• Support requests</li>
                  <li>• Booking-related communications</li>
                  <li>• Other communications you send through available platform features</li>
                </ul>
              </div>

              {/* Subsection F */}
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-bold text-[#e9c176]">F. Technical and Usage Information</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  We may automatically collect certain technical information, including:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400">
                  <li className="p-2 rounded bg-[#071024]">• Device information</li>
                  <li className="p-2 rounded bg-[#071024]">• Browser type</li>
                  <li className="p-2 rounded bg-[#071024]">• IP address</li>
                  <li className="p-2 rounded bg-[#071024]">• Operating system</li>
                  <li className="p-2 rounded bg-[#071024]">• Log information</li>
                  <li className="p-2 rounded bg-[#071024]">• App or website usage information</li>
                  <li className="p-2 rounded bg-[#071024] sm:col-span-2">• Cookies or similar technologies, where applicable</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  3
                </span>
                <h3 className="text-lg font-bold text-white">How We Use Your Information</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PunchX may use your information to:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 pl-4 border-l-2 border-zinc-800">
                <li>• Create and manage your account</li>
                <li>• Authenticate users and maintain secure sessions</li>
                <li>• Connect customers with relevant workers or service providers</li>
                <li>• Process service requests and bookings</li>
                <li>• Facilitate communication between users</li>
                <li>• Verify service providers where applicable</li>
                <li>• Process and manage payments, refunds, and transactions</li>
                <li>• Display and manage ratings and reviews</li>
                <li>• Provide customer support</li>
                <li>• Improve PunchX's website, mobile application, services, and user experience</li>
                <li>• Detect, investigate, and prevent fraud, abuse, security incidents, or unlawful activity</li>
                <li>• Comply with applicable legal obligations</li>
                <li>• Communicate important service, account, security, or policy updates</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  4
                </span>
                <h3 className="text-lg font-bold text-white">Authentication</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PunchX uses third-party authentication technology to help manage user registration, sign-in, account authentication, and sessions.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                When you use authentication services integrated with PunchX, certain account or identity information may also be processed by the relevant authentication provider according to its applicable terms and privacy practices.
              </p>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  5
                </span>
                <h3 className="text-lg font-bold text-white">Payments</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PunchX may use third-party payment technology to facilitate online payments.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                When making a payment, you may be directed to or interact with a payment service provider. Your payment-related information may be processed according to the applicable policies and terms of that provider.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PunchX may retain transaction information necessary for bookings, accounting, customer support, refunds, fraud prevention, and legal compliance.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  6
                </span>
                <h3 className="text-lg font-bold text-white">How We Share Information</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                We may share relevant information when necessary for the operation of PunchX.
              </p>

              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-bold text-white">Between Customers and Service Providers</h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  We may share information necessary to facilitate a requested service, booking, or communication. This may include relevant names, contact details, service requirements, booking information, and service location details where necessary.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-bold text-white">With Technology and Service Providers</h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  We may use trusted third-party providers for services such as:
                </p>
                <ul className="space-y-1 text-xs text-zinc-400 pl-4 border-l border-zinc-800">
                  <li>• Authentication</li>
                  <li>• Payment processing</li>
                  <li>• Website or application infrastructure</li>
                  <li>• Hosting and cloud services</li>
                  <li>• Communications</li>
                  <li>• Analytics</li>
                  <li>• Security and fraud prevention</li>
                </ul>
                <p className="text-xs text-zinc-400 mt-1">
                  These providers may process information only as necessary to provide their services or meet applicable legal requirements.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-bold text-white">For Legal and Safety Reasons</h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  We may disclose information where reasonably necessary to:
                </p>
                <ul className="space-y-1 text-xs text-zinc-400 pl-4 border-l border-zinc-800">
                  <li>• Comply with applicable law or a valid legal process</li>
                  <li>• Protect the safety, rights, or property of PunchX, our users, or others</li>
                  <li>• Investigate fraud, abuse, or security incidents</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a152e] border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>We do not sell users' personal information as a business activity.</span>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  7
                </span>
                <h3 className="text-lg font-bold text-white">Ratings and Reviews</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PunchX may allow customers and users to submit ratings and reviews.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Please do not include unnecessary personal, sensitive, abusive, defamatory, or unlawful information in reviews or other publicly visible content.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PunchX may moderate, remove, or restrict content that violates our policies, Terms of Service, applicable law, or the rights of others.
              </p>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  8
                </span>
                <h3 className="text-lg font-bold text-white">Data Security</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                We use reasonable technical and organisational measures designed to protect personal information against unauthorised access, loss, misuse, alteration, or disclosure.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                However, no internet-based system can guarantee complete security. Users are also responsible for protecting their account credentials and should not share passwords, authentication codes, or other security credentials with others.
              </p>
            </section>

            {/* Section 9 */}
            <section id="section-9" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  9
                </span>
                <h3 className="text-lg font-bold text-white">Data Retention</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                We retain personal information for as long as reasonably necessary to:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-300 pl-4 border-l-2 border-zinc-800">
                <li>• Provide and operate PunchX</li>
                <li>• Maintain user accounts and service records</li>
                <li>• Handle bookings, transactions, and refunds</li>
                <li>• Resolve disputes</li>
                <li>• Prevent fraud and abuse</li>
                <li>• Meet legal, regulatory, accounting, or security requirements</li>
              </ul>
              <p className="text-sm text-zinc-400 mt-2">
                When information is no longer required, we may delete, anonymise, or securely retain it where legally necessary.
              </p>
            </section>

            {/* Section 10 */}
            <section id="section-10" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  10
                </span>
                <h3 className="text-lg font-bold text-white">Your Rights and Choices</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Subject to applicable law, you may be able to request:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-300 pl-4 border-l-2 border-zinc-800">
                <li>• Access to certain personal information we hold about you</li>
                <li>• Correction of inaccurate or incomplete information</li>
                <li>• Deletion of information in appropriate circumstances</li>
                <li>• Other rights available under applicable data-protection law</li>
              </ul>
              <p className="text-sm text-zinc-300 leading-relaxed">
                To make a request, contact us using the details below. We may need to verify your identity before processing certain requests.
              </p>
            </section>

            {/* Section 11 */}
            <section id="section-11" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  11
                </span>
                <h3 className="text-lg font-bold text-white">Children's and Young Users' Privacy</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PunchX is intended for use in accordance with applicable law.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                If a user is below the age at which they can independently consent to the relevant processing or enter into relevant agreements under applicable law, appropriate parental, guardian, or other legally required consent may be necessary.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                We may take additional steps where required by applicable law to protect younger users.
              </p>
            </section>

            {/* Section 12 */}
            <section id="section-12" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  12
                </span>
                <h3 className="text-lg font-bold text-white">Third-Party Services</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PunchX may contain integrations with or links to third-party services.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Those services are operated independently and may have their own privacy policies and terms. PunchX is not responsible for the independent privacy practices of third-party services.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                We encourage users to review the relevant policies before providing information directly to third-party services.
              </p>
            </section>

            {/* Section 13 */}
            <section id="section-13" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e9c176] font-mono text-sm font-bold">
                  13
                </span>
                <h3 className="text-lg font-bold text-white">Changes to This Privacy Policy</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                As PunchX grows and our services develop, we may update this Privacy Policy.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                When we make changes, we will update the "Last Updated" date. Where required or appropriate, we may provide additional notice through the PunchX website, application, email, or another suitable method.
              </p>
            </section>

            {/* Section 14 */}
            <section id="section-14" className="scroll-mt-24 rounded-2xl bg-[#0a152e]/80 border border-[#c5a059]/40 p-6 sm:p-8 space-y-5 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] text-[#e9c176] font-mono text-sm font-bold">
                  14
                </span>
                <h3 className="text-lg font-bold text-white">Contact Us</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact:
              </p>
              
              <div className="p-5 rounded-xl bg-[#071024] border border-[#c5a059]/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 border border-[#c5a059]">
                    <img src={PUNCHX_LOGO} alt="PunchX" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">PunchX</h4>
                    <p className="text-[11px] font-mono text-[#c5a059]">Official Service Utility Platform</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800">
                  <p className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Website: <a href="https://www.punchxapp.co.in" className="text-[#e9c176] hover:underline">www.punchxapp.co.in</a></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Email: <a href="mailto:businressguy@gmail.com" className="text-[#e9c176] hover:underline">businressguy@gmail.com</a></span>
                  </p>
                </div>
              </div>

              <div className="pt-2 text-xs text-zinc-400 italic">
                By using PunchX, you acknowledge that you have read and understood this Privacy Policy.
              </div>
            </section>

            {/* Bottom Footer Navigation Card */}
            <div className="rounded-2xl bg-gradient-to-r from-[#0d1c3d] to-[#0a152e] border border-zinc-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-white">Review Platform Terms</h4>
                <p className="text-xs text-zinc-400">Read our user eligibility, customer, and service provider obligations.</p>
              </div>
              <button
                onClick={() => {
                  onTransition('terms-and-conditions');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#e9c176] text-black font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Read Terms & Conditions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </main>
        </div>

      </div>
    </div>
  );
}
