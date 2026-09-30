import React, { useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Search, ShieldCheck, Wrench } from 'lucide-react';
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
  return serviceCategories.find((category) => normalize(category.name) === target || normalize(category.id) === target || normalize(category.name).includes(target) || target.includes(normalize(category.name)));
};

export default function ServiceCategoryPage({ onTransition, selectedCategory, onSelectCategory, showNotification }: ServiceCategoryPageProps) {
  const [search, setSearch] = useState('');
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(null);
  const category = useMemo(() => findCategory(selectedCategory), [selectedCategory]);

  const filteredSubcategories = useMemo(() => {
    if (!category) return [];
    const query = normalize(search);
    if (!query) return category.subcategories;
    return category.subcategories.map((subcategory) => {
      const subMatches = normalize(subcategory.name).includes(query) || normalize(subcategory.description).includes(query);
      const items = subcategory.items.filter((item) => normalize(item.name).includes(query) || normalize(item.description).includes(query) || normalize(item.material || '').includes(query));
      return subMatches ? subcategory : { ...subcategory, items };
    }).filter((subcategory) => subcategory.items.length > 0 || normalize(subcategory.name).includes(query) || normalize(subcategory.description).includes(query));
  }, [category, search]);

  const bookItem = (item: ServiceItem) => {
    if (!category) return;
    onSelectCategory(category.name);
    try {
      localStorage.setItem('punchx_selected_service', JSON.stringify({ categoryId: category.id, categoryName: category.name, serviceId: item.id, serviceName: item.name, description: item.description, price: item.price, unit: item.unit || 'job', serviceType: item.serviceType || 'service', material: item.material || null }));
    } catch { /* Optional browser storage. */ }
    showNotification(`✓ ${item.name} selected. Finding verified ${category.name} specialists.`);
    onTransition('providers');
  };

  if (!category) return <div className="min-h-screen bg-[#07122a] text-white flex items-center justify-center px-6"><div className="max-w-lg w-full bg-[#0b1325] border border-[#c5a059]/30 rounded-2xl p-8 text-center"><Wrench className="w-10 h-10 text-[#c5a059] mx-auto mb-4"/><h1 className="text-xl font-bold mb-2">Service category not found</h1><p className="text-sm text-zinc-400 mb-6">Choose a category from the PunchX service directory.</p><button onClick={() => onTransition('home')} className="px-5 py-2.5 rounded-xl bg-[#c5a059] text-black font-bold">Back to Home</button></div></div>;

  return <div id="service-category-page" className="min-h-screen bg-[#07122a] text-[#e1e3e4] pb-24">
    <header className="sticky top-0 z-30 bg-[#07122a]/95 backdrop-blur-xl border-b border-[#c5a059]/20"><div className="max-w-7xl mx-auto px-4 sm:px-6 py-4"><div className="flex items-center gap-3 mb-4"><button onClick={() => onTransition('home')} className="p-2.5 rounded-xl bg-[#0b1325] border border-zinc-800 hover:border-[#c5a059]/50 text-[#c5a059]" aria-label="Back to home"><ArrowLeft className="w-5 h-5"/></button><div className="min-w-0 flex-1"><div className="text-[9px] uppercase tracking-[0.2em] text-[#e9c176] font-bold">PunchX Service Catalogue</div><h1 className="text-xl sm:text-2xl font-extrabold text-white truncate">{category.name}</h1></div><button onClick={() => { onSelectCategory(category.name); onTransition('providers'); }} className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#e9c176] text-black font-extrabold text-xs">Find Specialists <ChevronRight className="w-4 h-4"/></button></div><p className="text-sm text-zinc-400 max-w-3xl mb-4">{category.description}</p><div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#e9c176] font-bold mb-4"><ShieldCheck className="w-4 h-4"/> Verified independent specialists · Category-specific services · Materials shown before booking</div><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${category.name} services or materials...`} className="w-full bg-[#0b1325] border border-[#c5a059]/25 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-[#c5a059]/70"/></div></div></header>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6"><div className="grid gap-5">{filteredSubcategories.map((subcategory: ServicesSubcategory) => { const isOpen = expandedSubcategory === subcategory.id; return <section key={subcategory.id} className="rounded-2xl border border-[#c5a059]/20 bg-[#0b1325]/80 overflow-hidden shadow-lg"><button type="button" onClick={() => setExpandedSubcategory(isOpen ? null : subcategory.id)} className="w-full text-left p-4 sm:p-5 flex items-center gap-4 hover:bg-[#c5a059]/5 transition-colors"><img src={subcategory.image} alt={`${subcategory.name} service`} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#c5a059]/20" loading="lazy"/><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h2 className="text-base sm:text-lg font-bold text-white">{subcategory.name}</h2><span className="text-[9px] uppercase font-mono text-[#e9c176] bg-[#c5a059]/10 px-2 py-0.5 rounded-full">{subcategory.items.length} services</span></div><p className="text-xs sm:text-sm text-zinc-400">{subcategory.description}</p></div><ChevronDown className={`w-5 h-5 text-[#c5a059] transition-transform ${isOpen ? 'rotate-180' : ''}`}/></button>
      {isOpen && <div className="border-t border-[#c5a059]/15 p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{subcategory.items.map((item: ServiceItem) => <article key={item.id} className="rounded-xl border border-zinc-800 bg-[#07122a] overflow-hidden flex flex-col"><img src={item.image} alt={`${item.name} for ${category.name}`} className="w-full h-36 object-cover border-b border-zinc-800" loading="lazy"/><div className="p-4 flex flex-col flex-1"><div className="flex items-start justify-between gap-2"><h3 className="font-bold text-white text-sm">{item.name}</h3>{item.popular && <span className="shrink-0 text-[8px] uppercase bg-[#c5a059]/15 text-[#e9c176] px-2 py-1 rounded-full font-bold">Popular</span>}</div><p className="text-xs text-zinc-400 mt-2 leading-relaxed">{item.description}</p><div className="mt-3 rounded-lg border border-[#c5a059]/15 bg-[#c5a059]/5 p-3"><div className="text-[9px] uppercase tracking-wider text-[#e9c176] font-bold">Materials / items</div><div className="mt-1 text-[11px] leading-4 text-zinc-300">{item.material || 'Standard tools and consumables as applicable.'}</div></div><div className="flex items-end justify-between gap-3 mt-4 pt-3 border-t border-zinc-800"><div><div className="text-[9px] uppercase text-zinc-500">Starting from</div><div className="text-base font-extrabold text-[#e9c176]">₹{item.price.toLocaleString('en-IN')}</div><div className="mt-1 text-[9px] text-zinc-500">{item.duration || '30–60 min'} · ★ {item.rating || 4.8}</div></div><button onClick={() => bookItem(item)} className="px-3.5 py-2 rounded-lg bg-[#c5a059] text-black font-extrabold text-[10px] uppercase hover:bg-[#e9c176]">Book Service</button></div></div></article>)}</div>}</section>; })}</div>{filteredSubcategories.length === 0 && <div className="text-center py-16 text-zinc-400">No services or materials match your search.</div>}</main>

    <div className="fixed bottom-0 left-0 right-0 z-20 sm:hidden bg-[#07122a]/95 backdrop-blur border-t border-[#c5a059]/20 p-3"><button onClick={() => { onSelectCategory(category.name); onTransition('providers'); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#e9c176] text-black font-extrabold text-xs uppercase tracking-wider">Find {category.name} Specialists</button></div>
  </div>;
}
