import React, { useMemo } from 'react';
import { ArrowUpRight, BadgePercent, ExternalLink, Megaphone } from 'lucide-react';

type CategoryAd = {
  id: string;
  advertiser: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaLabel?: string;
  targetUrl: string;
  categoryIds?: string[];
  categoryNames?: string[];
  subcategoryNames?: string[];
  active?: boolean;
};

const normalise = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function loadAds(): CategoryAd[] {
  try {
    const raw = import.meta.env.VITE_PUNCHX_CATEGORY_ADS;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((ad): ad is CategoryAd =>
      ad && typeof ad.id === 'string' &&
      typeof ad.advertiser === 'string' &&
      typeof ad.title === 'string' &&
      typeof ad.description === 'string' &&
      typeof ad.targetUrl === 'string' &&
      /^https?:\\/\\//i.test(ad.targetUrl) &&
      ad.active !== false
    );
  } catch {
    return [];
  }
}

interface CategorySponsoredAdsProps {
  categoryId: string;
  categoryName: string;
  subcategoryName?: string;
}

export default function CategorySponsoredAds({ categoryId, categoryName, subcategoryName }: CategorySponsoredAdsProps) {
  const ads = useMemo(() => {
    const id = normalise(categoryId);
    const name = normalise(categoryName);
    const sub = normalise(subcategoryName || '');
    return loadAds().filter(ad => {
      const ids = (ad.categoryIds || []).map(normalise);
      const names = (ad.categoryNames || []).map(normalise);
      const subcategories = (ad.subcategoryNames || []).map(normalise);
      const categoryMatches = (!ids.length && !names.length) || ids.includes(id) || names.includes(name);
      const subcategoryMatches = !subcategories.length || (sub.length > 0 && subcategories.includes(sub));
      return categoryMatches && subcategoryMatches;
    }).slice(0, 6);
  }, [categoryId, categoryName, subcategoryName]);

  const visibleAds: CategoryAd[] = ads.length ? ads : [{
    id: `punchx-feature-${normalise(categoryId)}`,
    advertiser: 'PunchX Featured',
    title: `Explore ${categoryName.toLowerCase()} services`,
    description: subcategoryName
      ? `Explore ${subcategoryName.toLowerCase()} options, compare indicative prices and choose the work you need.`
      : `Explore ${categoryName.toLowerCase()} options, review indicative prices and select the service that fits your needs.`,
    ctaLabel: 'Explore services',
    targetUrl: 'https://www.punchxapp.co.in/home',
    active: true,
  }];

  return (
    <section aria-label={`Featured promotions for ${categoryName}`} className="my-4 overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#f0f1f5] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff4df] text-[#9a6411]"><Megaphone className="h-4 w-4" /></div>
          <div className="min-w-0"><h2 className="text-sm font-black text-[#171923]">Offers for {categoryName}</h2><p className="text-[10px] text-[#64748b]">Offers and featured placements related to your selection</p></div>
        </div>
        <span className="shrink-0 rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#555b66]">{ads.length ? 'Sponsored' : 'Featured'}</span>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-3 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {visibleAds.map(ad => (
          <article key={ad.id} className="flex w-[82%] min-w-[240px] max-w-sm shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#e8eaf0] bg-[#fbfcff] sm:w-auto sm:min-w-0 sm:max-w-none">
            {ad.imageUrl && /^https?:\\/\\//i.test(ad.imageUrl) ? <img src={ad.imageUrl} alt="" loading="lazy" className="h-36 w-full bg-[#eef2f8] object-cover" onError={event => { event.currentTarget.style.display = 'none'; }} /> : <div className="flex h-24 items-center gap-3 bg-gradient-to-r from-[#eff6ff] to-[#f5f3ff] px-4 text-[#315da8]"><BadgePercent className="h-8 w-8"/><span className="text-xs font-black">Special offer</span></div>}
            <div className="flex flex-1 flex-col p-3.5">
              <div className="text-[10px] font-bold text-[#64748b]">{ad.advertiser}</div>
              <h3 className="mt-1 text-sm font-black leading-5 text-[#171923]">{ad.title}</h3>
              <p className="mt-1 line-clamp-3 text-xs leading-5 text-[#64748b]">{ad.description}</p>
              <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer sponsored" className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-3 py-2.5 text-xs font-black text-white transition hover:bg-[#1d4ed8]">{ad.ctaLabel || 'View offer'} <ArrowUpRight className="h-4 w-4"/></a>
              <div className="mt-2 flex items-center gap-1 text-[9px] text-[#8a8f9b]"><ExternalLink className="h-3 w-3"/> {ads.length ? 'Opens advertiser website' : 'PunchX featured content'}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
