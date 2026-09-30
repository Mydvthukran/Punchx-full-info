import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Menu,
  Search,
  Share2,
  ShieldCheck,
  Star,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppScreen } from '../types';
import { serviceCategories, ServiceCategory, ServicesSubcategory, ServiceItem } from '../data/serviceCatalogs';

interface ServiceCategoryPageProps {
  onTransition: (target: AppScreen) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  showNotification: (msg: string) => void;
}

const normalize = (value: string) => value.trim().toLowerCase();

const findCategory = (name: string): ServiceCategory | undefined => {
  const target = normalize(name);
  return serviceCategories.find((category) => {
    const current = normalize(category.name);
    return current === target || normalize(category.id) === target || current.includes(target) || target.includes(current);
  });
};

const saveSelectedService = (category: ServiceCategory, item: ServiceItem) => {
  try {
    localStorage.setItem('punchx_selected_service', JSON.stringify({
      categoryId: category.id,
      categoryName: category.name,
      serviceId: item.id,
      serviceName: item.name,
      description: item.description,
      price: item.price,
      unit: item.unit || 'job',
      serviceType: item.serviceType || 'service',
      material: item.material || null,
      quantity: item.minQuantity || 1,
    }));
  } catch {
    // Navigation remains usable if browser storage is unavailable.
  }
};

export default function ServiceCategoryPage({
  onTransition,
  selectedCategory,
  onSelectCategory,
  showNotification,
}: ServiceCategoryPageProps) {
  const [search, setSearch] = useState('');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<ServiceItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedCount, setAddedCount] = useState(0);

  const category = useMemo(() => findCategory(selectedCategory), [selectedCategory]);

  const filteredSubcategories = useMemo(() => {
    if (!category) return [];
    const query = normalize(search);
    if (!query) return category.subcategories;
    return category.subcategories
      .map((subcategory) => {
        const subMatches = normalize(subcategory.name).includes(query) || normalize(subcategory.description).includes(query);
        const items = subcategory.items.filter((item) =>
          normalize(item.name).includes(query) || normalize(item.description).includes(query)
        );
        return subMatches ? subcategory : { ...subcategory, items };
      })
      .filter((subcategory) => subcategory.items.length > 0 || normalize(subcategory.name).includes(query));
  }, [category, search]);

  const allItems = useMemo(() => filteredSubcategories.flatMap((s) => s.items), [filteredSubcategories]);
  const quickServices = useMemo(() => {
    const seen = new Set<string>();
    return allItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    }).slice(0, 8);
  }, [allItems]);

  const addService = (item: ServiceItem, count = 1) => {
    if (!category) return;
    onSelectCategory(category.name);
    saveSelectedService(category, item);
    setAddedCount((value) => value + count);
    showNotification(`✓ ${item.name} added to your PunchX service request.`);
  };

  const bookService = (item: ServiceItem) => {
    if (!category) return;
    onSelectCategory(category.name);
    saveSelectedService(category, item);
    showNotification(`✓ ${item.name} selected. Finding verified ${category.name} specialists.`);
    onTransition('providers');
  };

  const openDetails = (item: ServiceItem) => {
    setDetailItem(item);
    setQuantity(item.minQuantity || 1);
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-[#f7f7fb] text-[#17171a] flex items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-[28px] bg-white p-8 text-center shadow-xl border border-black/5">
          <ShieldCheck className="mx-auto mb-4 h-11 w-11 text-[#7358d7]" />
          <h1 className="mb-2 text-2xl font-black">Service category not found</h1>
          <p className="mb-6 text-sm text-gray-500">Choose a category from the PunchX service directory.</p>
          <button onClick={() => onTransition('home')} className="rounded-xl bg-[#7358d7] px-6 py-3 font-bold text-white">Back to PunchX</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f9] text-[#15161a] pb-24">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => onTransition('home')} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-white hover:bg-gray-50" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-black sm:text-xl">{category.name}</h1>
              <div className="flex items-center gap-1 text-xs text-gray-500"><Clock3 className="h-3.5 w-3.5" /> Earliest slot available after specialist confirmation</div>
            </div>
            <button onClick={() => { if (navigator.share) navigator.share({ title: `PunchX ${category.name}`, text: `Explore ${category.name} services on PunchX.` }).catch(() => undefined); else showNotification('PunchX service link ready to share.'); }} className="grid h-11 w-11 place-items-center rounded-full border border-black/10" aria-label="Share"><Share2 className="h-5 w-5" /></button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${category.name} services...`} className="w-full rounded-2xl border border-black/10 bg-[#f5f5f7] py-3.5 pl-12 pr-10 text-sm font-medium outline-none focus:border-[#7358d7] focus:bg-white" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-500"><X className="h-4 w-4" /></button>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="pt-4 sm:pt-6">
          <div className="rounded-[24px] bg-white p-5 shadow-sm border border-black/5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#26785d]">
              <span className="rounded-full bg-[#eaf8f2] px-3 py-1.5"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> Verified independent professionals</span>
              <span className="rounded-full bg-[#f1edff] px-3 py-1.5 text-[#7358d7]">Transparent starting prices</span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div><h2 className="text-2xl font-black tracking-tight sm:text-3xl">{category.name} services</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{category.description}</p></div>
              {addedCount > 0 && <span className="rounded-full bg-[#7358d7] px-3 py-1.5 text-xs font-extrabold text-white">{addedCount} added</span>}
            </div>
          </div>
        </section>

        {quickServices.length > 0 && (
          <section className="py-5">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">Popular services</h2><span className="text-xs font-semibold text-[#7358d7]">Swipe to explore</span></div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {quickServices.map((item) => (
                <motion.button whileTap={{ scale: 0.96 }} key={item.id} onClick={() => openDetails(item)} className="w-[122px] shrink-0 rounded-2xl bg-white p-2 text-left shadow-sm border border-black/5">
                  <img src={item.image} alt={item.name} className="h-24 w-full rounded-xl bg-[#f3f3f5] object-cover" loading="lazy" />
                  <p className="mt-2 line-clamp-2 text-xs font-bold">{item.name}</p>
                  <p className="mt-1 text-xs font-extrabold text-[#7358d7]">₹{item.price.toLocaleString('en-IN')}</p>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-5 pb-6">
          {filteredSubcategories.map((subcategory: ServicesSubcategory) => {
            const isActive = activeSubcategory === subcategory.id;
            return (
              <section key={subcategory.id} className="overflow-hidden rounded-[24px] bg-white shadow-sm border border-black/5">
                <button type="button" onClick={() => setActiveSubcategory(isActive ? null : subcategory.id)} className="flex w-full items-center gap-4 p-4 text-left sm:p-5">
                  <img src={subcategory.image} alt={subcategory.name} className="h-16 w-20 shrink-0 rounded-2xl bg-[#f3f3f5] object-cover sm:h-20 sm:w-28" loading="lazy" />
                  <div className="min-w-0 flex-1"><h2 className="text-lg font-black sm:text-xl">{subcategory.name}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 sm:text-sm">{subcategory.description}</p><span className="mt-2 inline-block text-[11px] font-bold text-[#7358d7]">{subcategory.items.length} services</span></div>
                  <ChevronRight className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                </button>

                <div className="border-t border-black/5 px-4 sm:px-5">
                  {(isActive ? subcategory.items : subcategory.items.slice(0, 3)).map((item: ServiceItem, index) => (
                    <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }} key={item.id} className="flex gap-4 border-b border-black/5 py-5 last:border-b-0">
                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-black leading-5 sm:text-lg">{item.name}</h3>{item.popular && <span className="rounded-full bg-[#fff4dd] px-2 py-1 text-[9px] font-extrabold uppercase text-[#9b6500]">Popular</span>}</div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500"><Star className="h-3.5 w-3.5 fill-current" /> PunchX verified service</div>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500 sm:text-sm">{item.description}</p>
                        <p className="mt-3 text-sm font-black">Starts at ₹{item.price.toLocaleString('en-IN')}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => openDetails(item)} className="text-sm font-bold text-[#7358d7]">View details</button>
                          <button onClick={() => addService(item)} className="rounded-xl border border-[#7358d7]/25 bg-[#f3efff] px-4 py-2 text-xs font-extrabold text-[#7358d7]">Add service</button>
                        </div>
                      </div>
                      <div className="relative w-[128px] shrink-0 sm:w-[180px]">
                        <img src={item.image} alt={item.name} className="h-[128px] w-full rounded-2xl bg-[#f3f3f5] object-cover sm:h-[160px]" loading="lazy" />
                        <button onClick={() => bookService(item)} className="absolute -bottom-2 left-1/2 min-w-[82px] -translate-x-1/2 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-[#7358d7] shadow-lg ring-1 ring-black/5">Book</button>
                      </div>
                    </motion.article>
                  ))}
                  {!isActive && subcategory.items.length > 3 && <button onClick={() => setActiveSubcategory(subcategory.id)} className="flex w-full items-center justify-center gap-1 py-4 text-sm font-extrabold text-[#7358d7]">View all {subcategory.items.length} services <ChevronRight className="h-4 w-4" /></button>}
                </div>
              </section>
            );
          })}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/5 bg-white/95 px-4 py-3 shadow-[0_-6px_24px_rgba(0,0,0,.08)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="hidden flex-1 items-center gap-2 sm:flex"><Tag className="h-5 w-5 text-[#26785d]" /><span className="text-sm font-bold text-[#26785d]">PunchX verified pricing</span><span className="text-xs text-gray-500">Final amount is confirmed before booking.</span></div>
          <button onClick={() => { if (allItems[0]) bookService(allItems[0]); }} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7358d7] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#7358d7]/20 sm:w-auto"><Zap className="h-4 w-4" /> Find a professional</button>
        </div>
      </div>

      <AnimatePresence>
        {detailItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 sm:items-center" onClick={() => setDetailItem(null)}>
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-[30px] bg-white p-5 sm:rounded-[30px] sm:p-7">
              <div className="relative"><img src={detailItem.image} alt={detailItem.name} className="h-52 w-full rounded-3xl object-cover sm:h-64" /><button onClick={() => setDetailItem(null)} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white shadow-lg"><X className="h-5 w-5" /></button></div>
              <div className="mt-5 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">{detailItem.name}</h2><p className="mt-1 text-sm text-gray-500">Verified PunchX service</p></div><div className="text-right"><div className="text-xs text-gray-500">Starts at</div><div className="text-xl font-black text-[#7358d7]">₹{detailItem.price.toLocaleString('en-IN')}</div></div></div>
              <p className="mt-4 text-sm leading-6 text-gray-600">{detailItem.description}</p>
              {detailItem.material && <div className="mt-4 rounded-2xl bg-[#f7f7f9] p-4 text-sm"><span className="font-bold">Common material:</span> {detailItem.material}</div>}
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-black/5 p-3"><span className="text-sm font-bold">Quantity</span><div className="flex items-center gap-3"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f1f3] font-black">−</button><span className="w-5 text-center font-black">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f1f3] font-black">+</button></div></div>
              <div className="mt-5 grid grid-cols-2 gap-3"><button onClick={() => { addService(detailItem, quantity); setDetailItem(null); }} className="rounded-2xl border border-[#7358d7]/20 bg-[#f3efff] py-3.5 font-black text-[#7358d7]">Add to request</button><button onClick={() => { setDetailItem(null); bookService(detailItem); }} className="rounded-2xl bg-[#7358d7] py-3.5 font-black text-white">Book now</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => showNotification('PunchX service menu opened.')} className="fixed bottom-20 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-[#17181b] px-6 py-3 text-sm font-black text-white shadow-xl sm:flex"><Menu className="h-4 w-4" /> Menu</button>
    </div>
  );
}
