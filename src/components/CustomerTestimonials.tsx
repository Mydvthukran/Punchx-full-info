import React, { useState } from 'react';
import { Star, ShieldCheck, ThumbsUp, Quote, CheckCircle2, MapPin, Sparkles } from 'lucide-react';

export default function CustomerTestimonials() {
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const testimonials = [
    {
      id: 't-1',
      name: 'Dr. Ananya Sundaram',
      role: 'Homeowner, Indiranagar',
      category: 'AC Repair',
      rating: 5,
      date: '2 days ago',
      headline: 'Flawless inverter AC PCB diagnostics & swift refrigerant refill',
      review: 'My Daikin 1.5 Ton AC had stopped cooling during peak noon heat and was flashing an error code. Ramesh from PunchX arrived in under 20 minutes, diagnosed a faulty thermal thermistor and replaced it cleanly. The 30-day warranty card gave total peace of mind.',
      verified: true,
      serviceBadge: 'Split AC Deep Foam Jet & PCB Repair',
      initials: 'AS',
      color: 'from-amber-600 to-yellow-700'
    },
    {
      id: 't-2',
      name: 'Vikramaditya Hegde',
      role: 'Villa Resident, Whitefield',
      category: 'Electrical',
      rating: 5,
      date: '4 days ago',
      headline: 'Solved frequent MCB tripping that two other electricians failed to fix',
      review: 'Our main distribution panel was tripping every evening when high-draw kitchen appliances turned on. Suresh identified an unbalanced neutral load and an earth leakage fault within 30 minutes. Extremely polite and wore branded shoe covers and gloves throughout.',
      verified: true,
      serviceBadge: 'Main Distribution MCB Overhaul',
      initials: 'VH',
      color: 'from-blue-600 to-indigo-800'
    },
    {
      id: 't-3',
      name: 'Meera Krishnamurthy',
      role: 'Apartment Owner, Koramangala 4th Block',
      category: 'Plumbing',
      rating: 5,
      date: '1 week ago',
      headline: 'High-torque motorized drain unclogging saved our bathroom floor',
      review: 'Severe blockage in the master bath drain with backflow. The PunchX master plumber came equipped with a commercial mechanical rotational snake cable and cleared deep mineral blockage without breaking any tiles. Pristine cleanup afterwards.',
      verified: true,
      serviceBadge: 'Motorized Drain De-Clogging',
      initials: 'MK',
      color: 'from-emerald-600 to-teal-800'
    },
    {
      id: 't-4',
      name: 'Rohan Deshmukh',
      role: 'Tech Lead, HSR Layout Sector 2',
      category: 'Deep Clean',
      rating: 5,
      date: '2 weeks ago',
      headline: 'Hospital-grade sanitization before our housewarming ceremony',
      review: 'Booked the full 3BHK deep sanitization package. Team of 3 arrived with single-disc floor buffing machines and German steam extractors for our fabric sofa. Every single corner, chimney grease filter, and balcony glass was left sparkling.',
      verified: true,
      serviceBadge: 'Full 3BHK Floor Machine Buffing & Deep Steam',
      initials: 'RD',
      color: 'from-purple-600 to-pink-800'
    },
    {
      id: 't-5',
      name: 'Pooja Narang',
      role: 'Architect, JP Nagar 7th Phase',
      category: 'Carpentry',
      rating: 5,
      date: '3 weeks ago',
      headline: 'Restored customized modular soft-close telescopic channels',
      review: 'Our heavy kitchen tandem drawers had come off track and cabinet hinges were loose. The carpenter possessed all precise replacement hardware in his toolkit and completed the work with laser leveling. Outstanding craftmanship!',
      verified: true,
      serviceBadge: 'Modular Kitchen Telescopic Channel Fix',
      initials: 'PN',
      color: 'from-rose-600 to-orange-700'
    }
  ];

  const categories = ['All', 'AC Repair', 'Electrical', 'Plumbing', 'Deep Clean', 'Carpentry'];

  const filteredList = filterCategory === 'All' 
    ? testimonials 
    : testimonials.filter(t => t.category === filterCategory);

  return (
    <section id="customer-reviews-section" className="w-full space-y-6 pt-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059]/20 text-[#e9c176] text-xs font-mono font-bold uppercase tracking-wider mb-2 border border-[#c5a059]/30">
            <Star className="w-3.5 h-3.5 fill-[#e9c176]" />
            <span>Verified Citizen Experiences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trusted by 48,000+ Homes
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real feedback from residents across Bengaluru after verified on-site service completion.
          </p>
        </div>

        {/* Aggregate Ratings Metric */}
        <div className="flex items-center gap-4 bg-[#0a1630] border border-[#c5a059]/30 px-4 py-2.5 rounded-2xl">
          <div className="text-right">
            <div className="flex items-center gap-1 text-[#e9c176] justify-end">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-[#e9c176] text-[#e9c176]" />
              ))}
            </div>
            <span className="text-[11px] font-mono text-zinc-400">Based on 14,280+ ratings</span>
          </div>
          <div className="pl-3 border-l border-zinc-700">
            <span className="text-2xl font-black text-white font-mono leading-none">4.92</span>
            <span className="text-[10px] text-emerald-400 font-mono block font-bold">/ 5.0 STAR</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              filterCategory === cat
                ? 'bg-[#c5a059] text-black border-[#e9c176]'
                : 'bg-[#0a1630] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-[#09152e] border border-zinc-800 hover:border-[#c5a059]/40 transition-all flex flex-col justify-between shadow-xl relative group"
          >
            <div className="space-y-3">
              {/* Stars & Service Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#e9c176] text-[#e9c176]" />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-zinc-400">{item.date}</span>
              </div>

              {/* Service Tag */}
              <div className="inline-block px-2.5 py-0.5 rounded-lg bg-[#0e1d3d] border border-zinc-700 text-[10px] font-mono text-[#e9c176]">
                {item.serviceBadge}
              </div>

              <h4 className="text-sm font-bold text-white leading-snug">
                "{item.headline}"
              </h4>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {item.review}
              </p>
            </div>

            {/* Author Profile */}
            <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-xs shadow`}>
                  {item.initials}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white flex items-center gap-1">
                    {item.name}
                    {item.verified && (
                      <span title="Verified Customer Booking">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </span>
                    )}
                  </h5>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-[#c5a059]" /> {item.role}
                  </p>
                </div>
              </div>

              <span className="text-[9px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                VERIFIED JOB
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
