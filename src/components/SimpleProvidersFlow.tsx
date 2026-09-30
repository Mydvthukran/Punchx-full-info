import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, MapPin, Search, ShieldCheck, UserRound, Wrench, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { AppScreen, Worker } from '../types';
import { PUNCHX_50_CATEGORIES, isCategoryMatching } from '../data/categories';
import { DEMO_PROFESSIONALS } from '../data/demoProfessionals';

type Service = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  price?: number;
  duration?: string;
  reviews?: number;
  rating?: number;
  image?: string;
  faqs?: string[];
  demo?: boolean;
};

interface Props {
  onTransition: (target: AppScreen) => void;
  selectedCategory: string;
  onSelectCategory?: (category: string) => void;
  onSelectWorker: (worker: Worker) => void;
  showNotification: (message: string) => void;
  citizenAddress: string;
  setCitizenAddress?: (address: string) => void;
}

const DEMO_PROFESSIONALS_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_PROFESSIONALS === 'true';

const normalize = (id: string, data: any): Service | null => {
  const name = String(data.name || data.title || '').trim();
  const category = String(data.category || data.serviceCategory || '').trim();
  if (!name || !category) return null;
  const rawPrice = data.price ?? data.startingPrice ?? data.basePrice;
  const price = Number(rawPrice);
  return {
    id,
    name,
    category,
    subcategory: String(data.subcategory || data.serviceGroup || data.group || 'Services'),
    description: String(data.description || data.shortDescription || 'Service details are provided by PUNCHX.'),
    price: Number.isFinite(price) ? price : undefined,
    duration: typeof data.duration === 'string' ? data.duration : undefined,
    reviews: typeof data.reviewsCount === 'number' ? data.reviewsCount : undefined,
    rating: typeof data.rating === 'number' ? data.rating : undefined,
    image: typeof data.image === 'string' ? data.image : undefined,
    faqs: Array.isArray(data.faqs) ? data.faqs.map(String) : undefined,
    demo: false,
  };
};

const DEMO_SERVICES: Service[] = PUNCHX_50_CATEGORIES.map((item) => ({
  id: `demo-service-${item.id}`,
  name: `${item.name} Test Service`,
  category: item.name,
  subcategory: 'Demo service for QA testing',
  description: `Temporary PUNCHX demo service for testing the ${item.name} booking flow. This service is not a real customer offering.`,
  price: Number(item.basePrice || 199),
  duration: '60 min',
  reviews: 24,
  rating: 4.8,
  demo: true,
}));

export default function SimpleProvidersFlow({ onTransition, selectedCategory, onSelectCategory, onSelectWorker, showNotification, citizenAddress, setCitizenAddress }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'services' | 'details' | 'location' | 'datetime' | 'summary'>('services');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Service | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [address, setAddress] = useState(citizenAddress || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => setAddress(citizenAddress || ''), [citizenAddress]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'services'), snapshot => {
      const next = snapshot.docs.map(doc => normalize(doc.id, doc.data())).filter(Boolean) as Service[];
      setServices(next.filter(service => (service as any).active !== false));
      setLoading(false);
    }, error => {
      console.warn('PUNCHX service catalogue:', error);
      setServices([]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'workerApplications'), snapshot => {
      const next: Worker[] = snapshot.docs.filter(doc => doc.data().status === 'APPROVED').map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: String(data.legalName || 'Verified Professional'),
          category: String(data.skill || data.category || 'Professional'),
          categories: Array.isArray(data.categories) ? data.categories : undefined,
          rating: typeof data.rating === 'number' ? data.rating : 0,
          reviewsCount: typeof data.reviewsCount === 'number' ? data.reviewsCount : 0,
          avatar: String(data.photoURL || data.avatar || ''),
          proBadge: 'AUTHORIZED',
          price: Number(data.visitingFee || data.price || 0),
          visitingFee: Number(data.visitingFee || 0),
          available: data.available !== false,
          phone: String(data.phone || ''),
          address: String(data.address || '')
        } as Worker;
      });
      setWorkers(DEMO_PROFESSIONALS_ENABLED ? [...DEMO_PROFESSIONALS, ...next] : next);
    }, error => {
      console.warn('PUNCHX provider catalogue:', error);
      setWorkers(DEMO_PROFESSIONALS_ENABLED ? DEMO_PROFESSIONALS : []);
    });
    return () => unsub();
  }, []);

  const category = selectedCategory || 'All Services';
  const categoryServices = useMemo(() => {
    const matches = services.filter(service => {
      if (category.toLowerCase() === 'all services' || category.toLowerCase() === 'all') return true;
      return service.category.toLowerCase() === category.toLowerCase() || isCategoryMatching(service.category, category);
    }).filter(service => `${service.name} ${service.description} ${service.subcategory}`.toLowerCase().includes(query.toLowerCase().trim()));

    if (DEMO_PROFESSIONALS_ENABLED && matches.length === 0) {
      return DEMO_SERVICES.filter(service => {
        if (category.toLowerCase() === 'all services' || category.toLowerCase() === 'all') return true;
        return service.category.toLowerCase() === category.toLowerCase() || isCategoryMatching(service.category, category);
      }).filter(service => `${service.name} ${service.description} ${service.subcategory}`.toLowerCase().includes(query.toLowerCase().trim()));
    }

    return matches;
  }, [services, category, query]);

  const matchingWorkers = useMemo(() => {
    if (!selected) return [];
    return workers.filter(worker => {
      const matchesCategory = isCategoryMatching(worker.categories || worker.category, selected.category) || worker.category.toLowerCase() === selected.category.toLowerCase();
      return matchesCategory && worker.available !== false;
    }).sort((a, b) => b.rating - a.rating);
  }, [workers, selected]);

  const realProviderCount = matchingWorkers.length;

  const next = () => {
    if (step === 'services' && selected) setStep('details');
    else if (step === 'details') setStep('location');
    else if (step === 'location') {
      if (!address.trim()) { showNotification('Please enter the service address.'); return; }
      setCitizenAddress?.(address.trim());
      setStep('datetime');
    } else if (step === 'datetime') {
      if (!date || !time) { showNotification('Please choose a date and time.'); return; }
      setStep('summary');
    } else if (step === 'summary' && selected) {
      try {
        localStorage.setItem('punchx_pending_booking', JSON.stringify({
          serviceId: selected.id,
          serviceName: selected.name,
          category: selected.category,
          description: selected.description,
          price: selected.price ?? null,
          address: address.trim(),
          date,
          time,
          workerId: selectedWorker?.id || null,
          workerName: selectedWorker?.name || null,
          workerIsDemo: Boolean(selectedWorker?.id?.startsWith('demo-')),
          serviceIsDemo: Boolean(selected.demo),
          createdAt: new Date().toISOString()
        }));
      } catch (error) { console.warn('Could not persist pending booking:', error); }
      onSelectCategory?.(selected.category);
      if (selectedWorker) onSelectWorker(selectedWorker);
      onTransition('booking');
    }
  };

  const back = () => {
    if (step === 'services') onTransition('home');
    else if (step === 'details') setStep('services');
    else if (step === 'location') setStep('details');
    else if (step === 'datetime') setStep('location');
    else setStep('datetime');
  };

  const titles: Record<typeof step, string> = { services: category, details: 'Service details', location: 'Service location', datetime: 'Date & time', summary: 'Booking summary' };

  return <div className="min-h-screen bg-[#f7f8fa] pb-24 text-[#17191d]">
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center gap-3"><button onClick={back} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f5f7]"><ArrowLeft className="h-5 w-5" /></button><div className="min-w-0 flex-1"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b9098]">PUNCHX booking</div><h1 className="truncate text-lg font-black">{titles[step]}</h1></div><div className="text-[10px] font-bold text-[#858a93]">{['services','details','location','datetime','summary'].indexOf(step) + 1}/5</div></div>
    </header>

    <div className="mx-auto max-w-3xl px-4 pt-5 sm:px-6">
      <div className="mb-5 grid grid-cols-5 gap-1">{['services','details','location','datetime','summary'].map((item, index) => <div key={item} className={`h-1.5 rounded-full ${index <= ['services','details','location','datetime','summary'].indexOf(step) ? 'bg-[#7358d7]' : 'bg-[#e5e6ea]'}`} />)}</div>

      {step === 'services' && <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7"><div className="flex items-center gap-2 rounded-2xl bg-[#f6f7f9] px-3 py-2.5"><Search className="h-4 w-4 text-[#858a93]" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${category} services`} className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" />{query && <button onClick={() => setQuery('')}><X className="h-4 w-4" /></button>}</div>{loading ? <p className="mt-5 rounded-2xl bg-[#f6f7f9] p-5 text-sm text-[#777c85]">Loading PUNCHX services…</p> : categoryServices.length ? <div className="mt-5 space-y-3">{categoryServices.map(service => <button key={service.id} onClick={() => { setSelected(service); setSelectedWorker(null); }} className={`flex w-full gap-4 rounded-2xl border p-4 text-left ${selected?.id === service.id ? 'border-[#7358d7] bg-[#f3f0ff]' : 'border-black/5 bg-white'}`}><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f1f2f5]"><Wrench className="h-6 w-6 text-[#777c85]" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><div className="font-black">{service.name}</div>{service.demo && <span className="rounded-full bg-[#7358d7]/10 px-2 py-0.5 text-[9px] font-black text-[#7358d7]">DEMO</span>}</div><div className="mt-1 text-xs text-[#777c85]">{service.subcategory}</div><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#777c85]">{service.description}</p><div className="mt-2 text-sm font-black">Starts at ₹{Number(service.price || 0).toLocaleString('en-IN')}</div></div>{selected?.id === service.id && <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#7358d7]" />}</button>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-black/10 p-7 text-center"><Wrench className="mx-auto h-8 w-8 text-[#9da2aa]" /><p className="mt-3 font-black">No published services found</p><p className="mt-1 text-sm text-[#777c85]">Demo services are enabled only for PunchX QA testing.</p></div>}</section>}

      {step === 'details' && selected && <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8"><div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ecff]"><Wrench className="h-6 w-6 text-[#7358d7]" /></div><div><div className="text-xs font-bold uppercase tracking-wider text-[#8b9098]">Selected service</div><h2 className="text-2xl font-black">{selected.name}</h2>{selected.demo && <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-[#7358d7]">Demo QA service</div>}</div></div><p className="mt-5 text-sm leading-6 text-[#666b74]">{selected.description}</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#f6f7f9] p-4"><div className="text-xs text-[#8a8f98]">Price</div><div className="mt-1 font-black">₹{Number(selected.price || 0).toLocaleString('en-IN')}</div></div><div className="rounded-2xl bg-[#f6f7f9] p-4"><div className="text-xs text-[#8a8f98]">Professionals</div><div className="mt-1 font-black">{realProviderCount || 'Waiting for demo match'}</div></div></div>
        {DEMO_PROFESSIONALS_ENABLED && matchingWorkers.some(worker => worker.id.startsWith('demo-')) && <div className="mt-7 rounded-2xl border border-dashed border-[#7358d7]/30 bg-[#faf9ff] p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="font-black">Test professionals</h3><p className="mt-1 text-xs text-[#777c85]">Demo accounts are enabled for testing only and are never real workers.</p></div><span className="rounded-full bg-[#7358d7]/10 px-2.5 py-1 text-[10px] font-black text-[#7358d7]">DEMO</span></div><div className="mt-3 space-y-2">{matchingWorkers.slice(0, 5).map(worker => <button key={worker.id} onClick={() => { setSelectedWorker(worker); onSelectWorker(worker); }} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${selectedWorker?.id === worker.id ? 'border-[#7358d7] bg-[#f0ecff]' : 'border-black/5 bg-white'}`}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eeeafc]"><UserRound className="h-5 w-5 text-[#7358d7]" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-sm font-black">{worker.name}</span><span className="rounded-full bg-[#f1effa] px-2 py-0.5 text-[9px] font-black text-[#7358d7]">{worker.proBadge}</span></div><div className="mt-1 text-xs text-[#777c85]">⭐ {worker.rating.toFixed(1)} · {worker.reviewsCount} reviews · {worker.distanceKm ?? '—'} km</div><div className="mt-1 text-xs font-bold text-[#555a63]">Visit from ₹{worker.visitingFee ?? worker.price}</div></div>{selectedWorker?.id === worker.id && <CheckCircle2 className="h-5 w-5 shrink-0 text-[#7358d7]" />}</button>)}</div></div>}
        {selectedWorker && <div className="mt-4 rounded-2xl bg-[#f6f7f9] p-4 text-xs"><div className="font-black">Selected professional</div><div className="mt-1 text-[#666b74]">{selectedWorker.name} · {selectedWorker.rating.toFixed(1)} ⭐ · {selectedWorker.completedJobs ?? 0} completed jobs</div></div>}
        {selected.faqs?.length ? <div className="mt-6"><h3 className="font-black">FAQs</h3><div className="mt-2 space-y-2">{selected.faqs.slice(0,4).map((faq, i) => <p key={i} className="rounded-xl bg-[#f7f8fa] p-3 text-xs leading-5 text-[#666b74]">{faq}</p>)}</div></div> : null}</section>}

      {step === 'location' && <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8"><div className="flex items-center gap-3"><MapPin className="h-6 w-6 text-[#7358d7]" /><div><h2 className="text-xl font-black">Where should we come?</h2><p className="text-sm text-[#777c85]">Use the service address for this booking.</p></div></div><textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter service address" className="mt-6 min-h-32 w-full resize-none rounded-2xl bg-[#f6f7f9] p-4 text-sm font-semibold outline-none" /><p className="mt-3 text-xs text-[#858a93]">Location permission should only be requested when the active service needs it.</p></section>}

      {step === 'datetime' && <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8"><div className="flex items-center gap-3"><CalendarDays className="h-6 w-6 text-[#7358d7]" /><div><h2 className="text-xl font-black">When should we come?</h2><p className="text-sm text-[#777c85]">Choose your preferred date and time. Confirmed availability must come from the backend.</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="rounded-2xl bg-[#f6f7f9] p-4"><span className="text-xs font-bold text-[#8a8f98]">Date</span><input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-2 w-full bg-transparent text-sm font-bold outline-none" /></label><label className="rounded-2xl bg-[#f6f7f9] p-4"><span className="text-xs font-bold text-[#8a8f98]">Time</span><input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-2 w-full bg-transparent text-sm font-bold outline-none" /></label></div></section>}

      {step === 'summary' && selected && <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#7358d7]" /><span className="text-xs font-bold uppercase tracking-wider text-[#7358d7]">Review before confirming</span></div><div className="mt-5 space-y-4 text-sm"><div className="flex justify-between gap-4"><span className="text-[#777c85]">Service</span><span className="text-right font-black">{selected.name}</span></div>{selectedWorker && <div className="flex justify-between gap-4"><span className="text-[#777c85]">Professional</span><span className="text-right font-black">{selectedWorker.name}{selectedWorker.id.startsWith('demo-') ? ' (DEMO)' : ''}</span></div>}<div className="flex justify-between gap-4"><span className="text-[#777c85]">Address</span><span className="max-w-[60%] text-right font-bold">{address}</span></div><div className="flex justify-between gap-4"><span className="font-black">Date</span><span className="font-bold">{date}</span></div><div className="flex justify-between gap-4"><span className="font-black">Time</span><span className="font-bold">{time}</span></div><div className="flex justify-between gap-4 border-t border-black/5 pt-4"><span className="font-black">Applicable price</span><span className="font-black">₹{Number(selected.price || 0).toLocaleString('en-IN')}</span></div></div><p className="mt-5 rounded-2xl bg-[#f6f7f9] p-4 text-xs leading-5 text-[#6f747d]">Demo services and demo professionals are test data only. Production availability, live location and payment amounts must come from the PunchX backend.</p></section>}
    </div>

    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-white/95 p-3 backdrop-blur-xl"><div className="mx-auto flex max-w-3xl items-center gap-3"><div className="hidden min-w-0 flex-1 sm:block"><div className="text-xs font-black">{selected?.name || 'Select a service'}</div><div className="truncate text-[10px] text-[#858a93]">{selectedWorker ? `Professional: ${selectedWorker.name}` : step === 'summary' ? `${date} · ${time}` : 'One primary action per screen'}</div></div><button onClick={next} disabled={step === 'services' && !selected} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#7358d7] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{step === 'summary' ? 'Confirm booking' : 'Continue'} <ArrowRight className="h-4 w-4" /></button></div></div>
  </div>;
}
