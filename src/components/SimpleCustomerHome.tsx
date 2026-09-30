import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, Loader2, MapPin, Search, ShieldCheck, UserRound, Wrench } from 'lucide-react';
import { AppScreen, Worker } from '../types';
import { PUNCHX_50_CATEGORIES } from '../data/categories';
import PUNCHX_LOGO from '../assets/logo';
import { getAccurateCurrentPosition, reverseGeocodeCoords } from '../lib/location';

interface Props {
  onTransition: (target: AppScreen) => void;
  onSelectWorker: (worker: Worker) => void;
  onSelectCategory: (category: string) => void;
  citizenName: string;
  citizenAddress: string;
  onOpenProfile?: () => void;
}

const POPULAR = [
  ['AC Repair', 'AC Technician'],
  ['Electrician', 'Electrician'],
  ['Plumbing', 'Plumber'],
  ['Cleaning', 'Cleaner/Housekeeper'],
  ['Carpentry', 'Carpenter'],
  ['Painting', 'Painter'],
] as const;

const LOCATION_STORAGE_KEY = 'punchx_user_location';

export default function SimpleCustomerHome({ onTransition, onSelectCategory, citizenName, citizenAddress, onOpenProfile }: Props) {
  const [query, setQuery] = useState('');
  const [areaName, setAreaName] = useState('Choose your location');
  const [areaAddress, setAreaAddress] = useState(citizenAddress || '');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  const matches = useMemo(() => PUNCHX_50_CATEGORIES.filter(item =>
    `${item.name} ${item.shortDesc} ${item.keywords.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim())
  ), [query]);

  useEffect(() => {
    let cancelled = false;

    const refreshLocation = async () => {
      if (!navigator.geolocation) {
        setLocationMessage('Location is not supported on this device.');
        return;
      }
      setLocationLoading(true);
      setLocationMessage('Updating your service area…');
      try {
        const coords = await getAccurateCurrentPosition(true);
        const resolved = await reverseGeocodeCoords(coords.lat, coords.lng);
        if (cancelled) return;
        const nextArea = resolved.area || resolved.city || 'Local Area';
        setAreaName(nextArea);
        setAreaAddress(resolved.address || citizenAddress || '');
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
          lat: coords.lat,
          lng: coords.lng,
          address: resolved.address,
          area: nextArea,
          city: resolved.city,
          sector: resolved.sector,
          timestamp: new Date().toISOString(),
        }));
        setLocationMessage('Service area updated');
      } catch (error) {
        if (cancelled) return;
        setLocationMessage('Choose your service location to continue.');
        try {
          const cached = JSON.parse(localStorage.getItem(LOCATION_STORAGE_KEY) || '{}');
          if (cached.area) setAreaName(String(cached.area));
          if (cached.address) setAreaAddress(String(cached.address));
        } catch {}
      } finally {
        if (!cancelled) setLocationLoading(false);
      }
    };

    refreshLocation();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshLocation();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [citizenAddress]);

  const book = (category: string) => {
    onSelectCategory(category);
    onTransition('providers');
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-20 text-[#17191d]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-3 px-4 py-2 sm:px-6">
          <img src={PUNCHX_LOGO} alt="PUNCHX" className="h-9 w-9 rounded-xl object-contain" />
          <span className="text-xl font-black">PUNCHX</span>
          <button
            type="button"
            onClick={() => onTransition('customer-setup')}
            className="ml-1 flex min-w-0 max-w-[52%] items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-[#f6f7f9] sm:max-w-[380px]"
            aria-label="Change service location"
          >
            <MapPin className="h-4 w-4 shrink-0 text-[#7358d7]" />
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-[#8b9098]">Service area</span>
              <span className="block truncate text-xs font-black">{areaName}</span>
            </span>
            {locationLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#7358d7]" />}
          </button>
          <button onClick={onOpenProfile} className="ml-auto flex h-10 items-center gap-2 rounded-xl bg-[#f4f5f7] px-3" aria-label="Profile">
            <UserRound className="h-4 w-4" />
            <span className="hidden max-w-28 truncate text-xs font-bold sm:block">{citizenName || 'Profile'}</span>
          </button>
        </div>
        <div className="mx-auto flex max-w-6xl items-center gap-2 border-t border-black/5 px-4 py-2 sm:px-6">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#7358d7]" />
          <span className="truncate text-[11px] font-semibold text-[#70757e]">{areaAddress || citizenAddress || 'Location will be detected automatically when permission is available.'}</span>
          <span className="ml-auto shrink-0 text-[10px] font-bold text-[#7358d7]">{locationMessage}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="pt-6 md:pt-9">
          <div className="rounded-[28px] bg-[#17191d] p-6 text-white shadow-sm sm:p-9">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-bold text-white/70"><ShieldCheck className="h-4 w-4 text-[#b9a4ff]" /> Verified local professionals</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">What service do you need today?</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Choose a service, check availability in your service area, add the residential visit address, select a time, then confirm.</p>
              <div className="mt-6 flex items-center gap-2 rounded-2xl bg-white p-2">
                <Search className="ml-2 h-5 w-5 text-[#777c85]" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for AC repair, cleaning, electrician..." className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm font-semibold text-[#17191d] outline-none" />
                <button onClick={() => onTransition('providers')} className="rounded-xl bg-[#7358d7] px-4 py-3 text-xs font-black text-white">Browse all</button>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-8">
          <div className="flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7358d7]">Popular</p><h2 className="mt-1 text-2xl font-black">Popular services</h2></div><button onClick={() => onTransition('providers')} className="text-sm font-extrabold text-[#7358d7]">See all</button></div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {POPULAR.map(([label, category]) => <button key={label} onClick={() => book(category)} className="rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0ecff]"><Wrench className="h-5 w-5 text-[#7358d7]" /></div>
              <div className="mt-4 text-sm font-black">{label}</div>
              <div className="mt-1 text-[10px] leading-4 text-[#858a93]">Check availability near you</div>
            </button>)}
          </div>
        </section>

        <section className="pt-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Choose', 'Select the exact service you need.'],
              ['Check & Book', 'PUNCHX checks your area, address and available professionals before confirmation.'],
              ['Visit & Track', 'A professional receives the confirmed visit address and you can follow booking status.'],
            ].map(([title, text]) => <div key={title} className="rounded-2xl border border-black/5 bg-white p-5"><div className="text-xs font-black uppercase tracking-wider text-[#7358d7]">{title}</div><p className="mt-2 text-sm font-semibold leading-6">{text}</p></div>)}
          </div>
        </section>

        <section className="py-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5"><ShieldCheck className="h-5 w-5 text-[#7358d7]" /><h3 className="mt-3 font-black">Verified professionals</h3><p className="mt-1 text-xs leading-5 text-[#777c85]">Only backend-approved professional records can enter the booking flow.</p></div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5"><CalendarDays className="h-5 w-5 text-[#7358d7]" /><h3 className="mt-3 font-black">Availability first</h3><p className="mt-1 text-xs leading-5 text-[#777c85]">Unavailable services are stopped before final order placement.</p></div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5"><CheckCircle2 className="h-5 w-5 text-[#7358d7]" /><h3 className="mt-3 font-black">Residential visit</h3><p className="mt-1 text-xs leading-5 text-[#777c85]">The booking contains the exact address where the professional must visit.</p></div>
          </div>
        </section>

        {query && <section className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-2xl rounded-2xl border border-black/5 bg-white p-4 shadow-2xl sm:inset-x-auto">
          <div className="mb-3 flex items-center justify-between"><span className="text-sm font-black">Search results</span><button onClick={() => setQuery('')} className="text-xs font-bold text-[#7358d7]">Clear</button></div>
          <div className="max-h-60 space-y-2 overflow-auto">{matches.slice(0, 8).map(item => <button key={item.id} onClick={() => { setQuery(''); book(item.name); }} className="flex w-full items-center justify-between rounded-xl bg-[#f7f8fa] p-3 text-left"><span><span className="block text-sm font-black">{item.name}</span><span className="block text-[10px] text-[#858a93]">{item.shortDesc}</span></span><ArrowRight className="h-4 w-4 text-[#7358d7]" /></button>)}{!matches.length && <p className="p-3 text-sm text-[#777c85]">No matching published category found.</p>}</div>
        </section>}
      </main>
    </div>
  );
}
