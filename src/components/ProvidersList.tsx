import React, { useEffect, useMemo, useState } from 'react';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppScreen, Worker } from '../types';
import { PUNCHX_50_CATEGORIES, isCategoryMatching } from '../data/categories';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Grid2X2, MapPin, Search, Share2,
  ShieldCheck, ShoppingBag, Star, UserRound, Wrench, X, Zap, Clock3
} from 'lucide-react';

interface ProvidersListProps {
  onTransition: (target: AppScreen) => void;
  selectedCategory: string;
  onSelectCategory?: (category: string) => void;
  onSelectWorker: (worker: Worker) => void;
  authMethod: 'phone' | 'gmail';
  authTarget: string;
  showNotification: (msg: string) => void;
  citizenName: string;
  setCitizenName: (name: string) => void;
  citizenAddress: string;
  setCitizenAddress: (addr: string) => void;
}

type BackendService = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  price?: number;
  rating?: number;
  reviewsCount?: number;
  image?: string;
  options?: string[];
  earliestSlot?: string;
  active?: boolean;
};

const normalizeService = (id: string, data: any): BackendService | null => {
  const name = String(data.name || data.title || '').trim();
  const category = String(data.category || data.serviceCategory || '').trim();
  if (!name || !category) return null;
  const rawPrice = data.price ?? data.startingPrice ?? data.basePrice;
  const parsedPrice = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);
  return {
    id,
    name,
    category,
    subcategory: String(data.subcategory || data.serviceGroup || data.group || 'Other services'),
    description: String(data.description || data.shortDescription || 'Professional service from a verified local provider.'),
    price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
    rating: typeof data.rating === 'number' ? data.rating : undefined,
    reviewsCount: typeof data.reviewsCount === 'number' ? data.reviewsCount : undefined,
    image: typeof data.image === 'string' ? data.image : undefined,
    options: Array.isArray(data.options) ? data.options.map(String) : undefined,
    earliestSlot: typeof data.earliestSlot === 'string' ? data.earliestSlot : undefined,
    active: data.active !== false && data.status !== 'INACTIVE'
  };
};

export default function ProvidersList({
  onTransition,
  selectedCategory,
  onSelectCategory,
  onSelectWorker,
  showNotification,
  citizenAddress
}: ProvidersListProps) {
  const [services, setServices] = useState<BackendService[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [query, setQuery] = useState('');
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<BackendService | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState(citizenAddress || '');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [bookingStep, setBookingStep] = useState<'browse' | 'booking' | 'success'>('browse');

  useEffect(() => setAddress(citizenAddress || ''), [citizenAddress]);

  // Production service catalogue. No demo prices or fake availability are used.
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'services'), snapshot => {
      const next = snapshot.docs
        .map(doc => normalizeService(doc.id, doc.data()))
        .filter(Boolean) as BackendService[];
      setServices(next.filter(service => service.active !== false));
      setLoadingServices(false);
    }, error => {
      console.warn('PunchX services listener:', error);
      setServices([]);
      setLoadingServices(false);
    });
    return () => unsubscribe();
  }, []);

  // Production provider catalogue. Only approved workers are exposed.
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'workerApplications'), snapshot => {
      const next: Worker[] = snapshot.docs
        .filter(doc => doc.data().status === 'APPROVED')
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.legalName || 'Verified Professional',
            category: data.skill || data.category || 'Professional',
            categories: Array.isArray(data.categories) ? data.categories : undefined,
            rating: typeof data.rating === 'number' ? data.rating : 0,
            reviewsCount: typeof data.reviewsCount === 'number' ? data.reviewsCount : 0,
            avatar: data.photoURL || data.avatar || '',
            proBadge: 'AUTHORIZED',
            price: Number(data.visitingFee || data.price || 0),
            visitingFee: Number(data.visitingFee || 0),
            available: data.available !== false,
            address: data.address || '',
            phone: data.phone || ''
          };
        });
      setWorkers(next);
      setLoadingWorkers(false);
    }, error => {
      console.warn('PunchX provider listener:', error);
      setWorkers([]);
      setLoadingWorkers(false);
    });
    return () => unsubscribe();
  }, []);

  const category = selectedCategory || 'All Services';
  const categoryItems = useMemo(() => PUNCHX_50_CATEGORIES, []);

  const categoryServices = useMemo(() => {
    const filtered = services.filter(service => {
      if (category.toLowerCase() === 'all services' || category.toLowerCase() === 'all specialties' || category.toLowerCase() === 'all') return true;
      return service.category.toLowerCase() === category.toLowerCase() || isCategoryMatching(service.category, category);
    });
    const q = query.trim().toLowerCase();
    return filtered.filter(service => !q || `${service.name} ${service.description} ${service.subcategory}`.toLowerCase().includes(q));
  }, [services, category, query]);

  const subcategories = useMemo(() => Array.from(new Set(categoryServices.map(s => s.subcategory).filter(Boolean))), [categoryServices]);
  const visibleServices = useMemo(() => selectedSubcategory ? categoryServices.filter(s => s.subcategory === selectedSubcategory) : categoryServices, [categoryServices, selectedSubcategory]);

  const matchingWorkers = useMemo(() => {
    if (!selectedService) return [];
    return workers.filter(worker => isCategoryMatching(worker.categories || worker.category, selectedService.category) || worker.category.toLowerCase() === selectedService.category.toLowerCase());
  }, [workers, selectedService]);

  const averageRating = useMemo(() => {
    const rated = matchingWorkers.filter(w => w.rating > 0);
    if (!rated.length) return null;
    return rated.reduce((sum, w) => sum + w.rating, 0) / rated.length;
  }, [matchingWorkers]);

  const openService = (service: BackendService) => {
    setSelectedService(service);
    setDetailsOpen(true);
  };

  const confirmBooking = () => {
    if (!selectedService || !address.trim() || !date || !time) {
      showNotification('Please choose an address, date and time before confirming.');
      return;
    }
    const provider = matchingWorkers.find(w => w.id === selectedProviderId) || matchingWorkers[0];
    if (provider) onSelectWorker(provider);
    setBookingStep('success');
    showNotification('Booking request prepared. The provider panel can receive the assignment.');
  };

  const back = () => {
    if (bookingStep === 'booking') {
      setBookingStep('browse');
      return;
    }
    onTransition('home');
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#17191d] pb-28">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <button onClick={back} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f5f7]" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b9098]">PunchX service booking</div>
            <h1 className="truncate text-lg font-black">{bookingStep === 'booking' ? 'Confirm booking' : category}</h1>
          </div>
          <button onClick={() => setCategorySheetOpen(true)} className="flex h-10 items-center gap-2 rounded-xl border border-black/5 bg-white px-3 text-xs font-extrabold"><Grid2X2 className="h-4 w-4" /> Services</button>
          <button onClick={() => navigator.share?.({ title: 'PunchX', text: `Book ${category} services on PunchX.` }).catch(() => undefined)} className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#f4f5f7] sm:flex" aria-label="Share"><Share2 className="h-4 w-4" /></button>
        </div>
      </header>

      {bookingStep === 'success' ? (
        <main className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#efeaff]"><CheckCircle2 className="h-10 w-10 text-[#7358d7]" /></div>
          <h2 className="mt-6 text-3xl font-black">Booking request created</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6f747d]">Your selected service, address and preferred slot are ready for the provider workflow. Live status should be driven by production booking events.</p>
          <div className="mt-7 rounded-2xl border border-black/5 bg-white p-5 text-left shadow-sm">
            <div className="font-extrabold">{selectedService?.name}</div>
            <div className="mt-2 text-sm text-[#6f747d]">{address}</div>
            <div className="mt-2 text-sm font-bold">{date} · {time}</div>
          </div>
          <button onClick={() => onTransition('home')} className="mt-6 rounded-xl bg-[#7358d7] px-6 py-3 text-sm font-extrabold text-white">Back to PunchX</button>
        </main>
      ) : bookingStep === 'booking' ? (
        <main className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 md:grid-cols-[1fr_360px] md:py-8">
          <section className="space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8b9098]">A · Selected service</div>
              <div className="mt-3 flex items-start gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2efff]"><Wrench className="h-6 w-6 text-[#7358d7]" /></div><div className="min-w-0 flex-1"><h2 className="font-black">{selectedService?.name}</h2><p className="mt-1 text-sm text-[#70757e]">{selectedService?.description}</p></div>{typeof selectedService?.price === 'number' && <div className="font-black">₹{selectedService.price.toLocaleString('en-IN')}</div>}</div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8b9098]">B · Address</div>
              <div className="mt-3 flex items-start gap-3"><MapPin className="mt-1 h-5 w-5 text-[#7358d7]" /><textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter service address" className="min-h-24 flex-1 resize-none rounded-xl bg-[#f6f7f9] p-3 text-sm font-semibold outline-none" /></div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8b9098]">C · Date & time</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="rounded-xl bg-[#f6f7f9] p-3"><span className="text-xs font-bold text-[#8b9098]">Date</span><input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full bg-transparent text-sm font-bold outline-none" /></label><label className="rounded-xl bg-[#f6f7f9] p-3"><span className="text-xs font-bold text-[#8b9098]">Preferred time</span><input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 w-full bg-transparent text-sm font-bold outline-none" /></label></div><p className="mt-3 text-xs text-[#8b9098]">Confirmed availability must come from the production backend.</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8b9098]">D · Provider assignment</div>
              {loadingWorkers ? <p className="mt-3 text-sm text-[#70757e]">Loading verified providers…</p> : matchingWorkers.length ? <div className="mt-3 space-y-2">{matchingWorkers.map(worker => <button key={worker.id} onClick={() => setSelectedProviderId(worker.id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${selectedProviderId === worker.id ? 'border-[#7358d7] bg-[#f3f0ff]' : 'border-black/5 bg-white'}`}><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#191b20] text-white"><UserRound className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="font-extrabold">{worker.name}</div><div className="text-xs text-[#7a7f88]">{worker.rating ? `${worker.rating.toFixed(1)} rating` : 'New provider'} · {worker.available === false ? 'Unavailable' : 'Available'}</div></div>{selectedProviderId === worker.id && <CheckCircle2 className="h-5 w-5 text-[#7358d7]" />}</button>)}</div> : <p className="mt-3 rounded-xl bg-[#fff7e8] p-3 text-sm text-[#765d2c]">No approved provider is currently matched to this service. PunchX will not display fake availability.</p>}
            </div>
          </section>
          <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:sticky md:top-24"><div className="text-xs font-bold uppercase tracking-wider text-[#8b9098]">Booking summary</div><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-[#777c85]">Service</span><span className="text-right font-bold">{selectedService?.name}</span></div><div className="flex justify-between gap-4"><span className="text-[#777c85]">Price</span><span className="font-bold">{typeof selectedService?.price === 'number' ? `₹${selectedService.price.toLocaleString('en-IN')}` : 'Backend quote'}</span></div><div className="border-t border-black/5 pt-3"><div className="flex justify-between gap-4"><span className="font-black">Estimated total</span><span className="font-black">{typeof selectedService?.price === 'number' ? `₹${selectedService.price.toLocaleString('en-IN')}` : 'Calculated at confirmation'}</span></div></div></div><button onClick={confirmBooking} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7358d7] px-4 py-3 text-sm font-extrabold text-white">Confirm booking <ArrowRight className="h-4 w-4" /></button></aside>
        </main>
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:py-8">
          <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
            <div className="border-b border-black/5 p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-bold text-[#7c818a]"><ShieldCheck className="h-4 w-4 text-[#7358d7]" /> Verified local professionals</div><h2 className="mt-2 text-3xl font-black tracking-tight">{category}</h2><div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#6e737c]">{averageRating ? <span className="inline-flex items-center gap-1 font-bold"><Star className="h-4 w-4 fill-current text-amber-500" /> {averageRating.toFixed(1)} provider rating</span> : <span>Ratings appear when providers have real reviews.</span>}<span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> Availability from backend</span></div></div><button onClick={() => setCategorySheetOpen(true)} className="rounded-xl border border-black/5 px-3 py-2 text-xs font-extrabold">Change service</button></div>
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#f6f7f9] px-3 py-2.5"><Search className="h-4 w-4 text-[#858a93]" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${category} services`} className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" />{query && <button onClick={() => setQuery('')}><X className="h-4 w-4" /></button>}</div>
            </div>
            <div className="p-5 sm:p-7">
              {subcategories.length > 0 && <div className="mb-7"><div className="mb-3 text-base font-black">Service shortcuts</div><div className="flex gap-3 overflow-x-auto pb-2">{subcategories.map(group => <button key={group} onClick={() => setSelectedSubcategory(selectedSubcategory === group ? null : group)} className={`shrink-0 rounded-2xl border px-4 py-3 text-left ${selectedSubcategory === group ? 'border-[#7358d7] bg-[#f2efff]' : 'border-black/5 bg-white'}`}><div className="text-sm font-extrabold">{group}</div><div className="mt-1 text-xs text-[#838891]">{categoryServices.filter(s => s.subcategory === group).length} services</div></button>)}</div></div>}
              <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-black">{selectedSubcategory || 'Services'}</h3><span className="text-xs font-bold text-[#8a8f98]">{visibleServices.length} available</span></div>
              {loadingServices ? <div className="rounded-2xl bg-[#f6f7f9] p-6 text-sm text-[#777c85]">Loading production service catalogue…</div> : visibleServices.length ? <div className="space-y-3">{visibleServices.map(service => <article key={service.id} className="flex gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#f1f2f5] overflow-hidden">{service.image ? <img src={service.image} alt="" className="h-full w-full object-cover" /> : <Wrench className="h-7 w-7 text-[#7a7f88]" />}</div><div className="min-w-0 flex-1"><h4 className="font-black">{service.name}</h4><div className="mt-1 flex items-center gap-2 text-xs text-[#70757e]">{service.rating ? <><Star className="h-3.5 w-3.5 fill-current text-amber-500" /> {service.rating.toFixed(1)} {service.reviewsCount ? `(${service.reviewsCount})` : ''}</> : 'Verified service'}</div><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#7b8088]">{service.description}</p>{typeof service.price === 'number' ? <div className="mt-2 text-sm font-black">Starts at ₹{service.price.toLocaleString('en-IN')}</div> : <div className="mt-2 text-sm font-black text-[#6f747d]">Price from backend</div>}</div><div className="flex shrink-0 flex-col items-end gap-2"><button onClick={() => openService(service)} className="text-xs font-extrabold text-[#7358d7]">View details</button><button onClick={() => { setSelectedService(service); setBookingStep('booking'); }} className="rounded-xl bg-[#7358d7] px-4 py-2 text-xs font-extrabold text-white">Add</button>{service.options?.length ? <span className="text-[10px] text-[#8a8f98]">{service.options.length} options</span> : null}</div></article>)}</div> : <div className="rounded-2xl border border-dashed border-black/10 bg-[#fafbfc] p-8 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-[#a0a5ad]" /><h3 className="mt-3 font-black">No published services found</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777c85]">PunchX is connected to the production service catalogue. Once a service is published in the backend, its real price and availability will appear here.</p></div>}
            </div>
          </section>
        </main>
      )}

      {detailsOpen && selectedService && <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6" onClick={() => setDetailsOpen(false)}><div className="w-full max-w-xl rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]" onClick={e => e.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-wider text-[#8a8f98]">Service details</div><h2 className="mt-1 text-2xl font-black">{selectedService.name}</h2></div><button onClick={() => setDetailsOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f5f7]"><X className="h-4 w-4" /></button></div><p className="mt-4 text-sm leading-6 text-[#666b74]">{selectedService.description}</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#f6f7f9] p-4"><div className="text-xs text-[#8a8f98]">Price</div><div className="mt-1 font-black">{typeof selectedService.price === 'number' ? `₹${selectedService.price.toLocaleString('en-IN')}` : 'Backend quote'}</div></div><div className="rounded-2xl bg-[#f6f7f9] p-4"><div className="text-xs text-[#8a8f98]">Options</div><div className="mt-1 font-black">{selectedService.options?.length || 'Standard'}</div></div></div><button onClick={() => { setDetailsOpen(false); setBookingStep('booking'); }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7358d7] px-4 py-3 text-sm font-extrabold text-white">Continue to booking <ArrowRight className="h-4 w-4" /></button></div></div>}

      {categorySheetOpen && <div className="fixed inset-0 z-[70] bg-black/45" onClick={() => setCategorySheetOpen(false)}><div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-white p-5 sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between"><div><div className="text-xs font-bold uppercase tracking-wider text-[#8a8f98]">PUNCHX</div><h2 className="text-xl font-black">Choose a service category</h2></div><button onClick={() => setCategorySheetOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f5f7]"><X className="h-4 w-4" /></button></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{categoryItems.map(item => <button key={item.id} onClick={() => { onSelectCategory?.(item.name); setSelectedSubcategory(null); setQuery(''); setCategorySheetOpen(false); }} className={`rounded-2xl border p-3 text-left ${item.name.toLowerCase() === category.toLowerCase() ? 'border-[#7358d7] bg-[#f2efff]' : 'border-black/5 bg-white'}`}><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f3f5]"><Zap className="h-5 w-5 text-[#7358d7]" /></div><div className="mt-2 text-sm font-extrabold">{item.name}</div><div className="mt-1 line-clamp-2 text-[11px] text-[#858a92]">{item.shortDesc}</div></button>)}</div></div></div>}

      {bookingStep === 'browse' && <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-white/95 px-4 py-3 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2efff]"><ShoppingBag className="h-4 w-4 text-[#7358d7]" /></div><div><div className="text-xs font-extrabold">Booking</div><div className="text-[10px] text-[#858a92]">Select a service to continue</div></div></div>{selectedService ? <button onClick={() => setBookingStep('booking')} className="rounded-xl bg-[#7358d7] px-5 py-2.5 text-xs font-extrabold text-white">Continue</button> : <span className="text-xs text-[#999da5]">No service selected</span>}</div></div>}
    </div>
  );
}
