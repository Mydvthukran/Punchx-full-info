import React, { useEffect, useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, Package } from 'lucide-react';

type CartLine = {
  id: string;
  serviceName: string;
  category?: string;
  subcategory?: string;
  description?: string;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  quantity?: number;
  itemType?: 'service' | 'product';
};

const readCart = (): CartLine[] => {
  try {
    const value = JSON.parse(localStorage.getItem('punchx_cart') || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const money = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(value);

interface CitizenCartButtonProps {
  onCheckout: (hasItems: boolean) => void;
}

export default function CitizenCartButton({ onCheckout }: CitizenCartButtonProps) {
  const [cart, setCart] = useState<CartLine[]>(readCart);
  const [open, setOpen] = useState(false);
  const refresh = () => setCart(readCart());

  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    const timer = window.setInterval(refresh, 1000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.clearInterval(timer);
    };
  }, []);

  const count = cart.reduce((sum, item) => sum + Math.max(1, Number(item.quantity || 1)), 0);
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const changeQuantity = (id: string, delta: number) => {
    const next = cart.map(item => item.id === id
      ? { ...item, quantity: Math.max(1, Math.min(99, Number(item.quantity || 1) + delta)), price: Math.round((Number(item.price || 0) / Math.max(1, Number(item.quantity || 1))) * Math.max(1, Math.min(99, Number(item.quantity || 1) + delta))), priceMin: typeof item.priceMin === 'number' ? Math.round((item.priceMin / Math.max(1, Number(item.quantity || 1))) * Math.max(1, Math.min(99, Number(item.quantity || 1) + delta))) : item.priceMin, priceMax: typeof item.priceMax === 'number' ? Math.round((item.priceMax / Math.max(1, Number(item.quantity || 1))) * Math.max(1, Math.min(99, Number(item.quantity || 1) + delta))) : item.priceMax }
      : item);
    setCart(next);
    try { localStorage.setItem('punchx_cart', JSON.stringify(next)); } catch {}
  };

  const removeItem = (id: string) => {
    const next = cart.filter(item => item.id !== id);
    setCart(next);
    try { localStorage.setItem('punchx_cart', JSON.stringify(next)); } catch {}
  };

  return (
    <>
      <button type="button" onClick={() => { refresh(); setOpen(true); }} aria-label={`Open cart, ${count} items`} className="relative flex h-10 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 text-[#262a33] transition hover:border-[#c9c0ff] hover:bg-[#f8f6ff]">
        <ShoppingCart className="h-5 w-5" />
        <span className="hidden text-xs font-extrabold sm:inline">Cart</span>
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7358d7] px-1 text-[9px] font-black text-white">{count > 99 ? '99+' : count}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-[#101828]/60 p-3 sm:p-5" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="punchx-cart-title" className="relative flex max-h-[min(82dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl sm:rounded-3xl">
            <header className="flex shrink-0 items-center justify-between border-b border-[#ececf2] bg-white px-5 py-4 sm:px-6">
              <div><h2 id="punchx-cart-title" className="text-lg font-black text-[#17191d]">Your cart</h2><p className="mt-0.5 text-xs text-[#777b86]">{count} item{count === 1 ? '' : 's'} selected</p></div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close cart" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f4f7]"><X className="h-4 w-4" /></button>
            </header>
            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f1edff] text-[#7358d7]"><ShoppingCart className="h-7 w-7" /></div>
                <h3 className="mt-4 text-base font-black text-[#20232b]">Your cart is empty</h3>
                <p className="mt-2 text-sm leading-6 text-[#777b86]">Select a service or a product/material and it will appear here.</p>
                <button type="button" onClick={() => { setOpen(false); onCheckout(false); }} className="mt-5 rounded-xl bg-[#7358d7] px-5 py-3 text-xs font-black text-white">Browse services</button>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 sm:p-5">
                  {cart.map((item, index) => (
                    <article key={item.id || index} className="rounded-2xl border border-[#e8e8ef] p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1edff] text-[#7358d7]"><Package className="h-5 w-5" /></div>
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-sm font-black text-[#20232b]">{item.serviceName}</h3>
                          <p className="mt-1 text-[10px] text-[#777b86]">{[item.category, item.subcategory].filter(Boolean).join(' · ') || (item.itemType === 'product' ? 'Product / material' : 'Service')}</p>
                          {item.description && <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#777b86]">{item.description}</p>}
                          {typeof item.priceMin === 'number' && typeof item.priceMax === 'number'
                            ? <p className="mt-2 text-sm font-black text-[#17191d]">{money(item.priceMin)}–{money(item.priceMax)} <span className="text-[10px] font-medium text-[#858995]">estimate</span></p>
                            : <p className="mt-2 text-sm font-black text-[#17191d]">{money(Number(item.price || 0))} <span className="text-[10px] font-medium text-[#858995]">indicative</span></p>}
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1 rounded-xl border border-[#e6e6ee] p-1">
                              <button type="button" aria-label={`Decrease ${item.serviceName} quantity`} onClick={() => changeQuantity(item.id, -1)} disabled={Number(item.quantity || 1) <= 1} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#f4f2ff] disabled:opacity-30"><Minus className="h-3.5 w-3.5" /></button>
                              <span className="min-w-6 text-center text-xs font-black">{Number(item.quantity || 1)}</span>
                              <button type="button" aria-label={`Increase ${item.serviceName} quantity`} onClick={() => changeQuantity(item.id, 1)} disabled={Number(item.quantity || 1) >= 99} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#f4f2ff] disabled:opacity-30"><Plus className="h-3.5 w-3.5" /></button>
                            </div>
                            <button type="button" onClick={() => removeItem(item.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <footer className="shrink-0 border-t border-[#ececf2] bg-white p-4 sm:p-5">
                  <div className="flex items-center justify-between"><span className="text-sm font-bold text-[#656a75]">Indicative service total</span><span className="text-xl font-black text-[#17191d]">{money(total)}</span></div>
                  <p className="mt-2 text-[10px] leading-4 text-[#858995]">Final service/material price may change after professional inspection or supplier confirmation.</p>
                  <button type="button" onClick={() => { setOpen(false); onCheckout(true); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7358d7] px-5 py-3.5 text-sm font-black text-white hover:bg-[#5b45c7]">Continue to booking <ArrowRight className="h-4 w-4" /></button>
                </footer>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
