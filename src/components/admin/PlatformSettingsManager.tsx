import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit3, Save, Wrench, DollarSign, ShieldCheck, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PlatformSettingsManagerProps {
  showNotification: (msg: string) => void;
}

export default function PlatformSettingsManager({ showNotification }: PlatformSettingsManagerProps) {
  // Configurable Fee Rates
  const [warrantyFee, setWarrantyFee] = useState<number>(() => {
    const saved = localStorage.getItem('punchx_cfg_warranty_fee');
    return saved ? Number(saved) : 99;
  });
  const [visitingSubsidy, setVisitingSubsidy] = useState<number>(() => {
    const saved = localStorage.getItem('punchx_cfg_visiting_subsidy');
    return saved ? Number(saved) : 59;
  });
  const [emergencyFee, setEmergencyFee] = useState<number>(() => {
    const saved = localStorage.getItem('punchx_cfg_emergency_fee');
    return saved ? Number(saved) : 199;
  });
  const [personalFee, setPersonalFee] = useState<number>(() => {
    const saved = localStorage.getItem('punchx_cfg_personal_fee');
    return saved ? Number(saved) : 99;
  });

  // Dynamic Service Catalog State
  const [services, setServices] = useState<Array<{ id: string; name: string; basePrice: number; category: string; available: boolean }>>(() => {
    const saved = localStorage.getItem('punchx_cfg_services');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.warn(e); }
    }
    return [
      { id: 'srv_1', name: 'Air Conditioner Jet Service & Gas Refill', basePrice: 699, category: 'AC Repair', available: true },
      { id: 'srv_2', name: 'Electrical Short Circuit & Wiring Fix', basePrice: 299, category: 'Electrical', available: true },
      { id: 'srv_3', name: 'Pipe Leakage & Sanitary Fitting', basePrice: 349, category: 'Plumbing', available: true },
      { id: 'srv_4', name: 'Deep House Sanitization & Cleaning', basePrice: 999, category: 'Cleaning', available: true },
      { id: 'srv_5', name: 'Washing Machine Motor & PCB Repair', basePrice: 549, category: 'Appliance Repair', available: true },
      { id: 'srv_6', name: 'Refrigerator Cooling & Compressor Diagnostics', basePrice: 649, category: 'Appliance Repair', available: true }
    ];
  });

  // New Service inputs
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(499);
  const [newServiceCategory, setNewServiceCategory] = useState('AC Repair');

  // Save Settings
  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('punchx_cfg_warranty_fee', warrantyFee.toString());
    localStorage.setItem('punchx_cfg_visiting_subsidy', visitingSubsidy.toString());
    localStorage.setItem('punchx_cfg_emergency_fee', emergencyFee.toString());
    localStorage.setItem('punchx_cfg_personal_fee', personalFee.toString());
    showNotification('✓ Platform Fee Rates & Guarantee Subsidies updated successfully!');
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newSrv = {
      id: `srv_${Date.now()}`,
      name: newServiceName.trim(),
      basePrice: Number(newServicePrice) || 299,
      category: newServiceCategory,
      available: true
    };

    const updated = [...services, newSrv];
    setServices(updated);
    localStorage.setItem('punchx_cfg_services', JSON.stringify(updated));
    setNewServiceName('');
    showNotification(`✓ New Service "${newSrv.name}" added to catalog!`);
  };

  const handleDeleteService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    localStorage.setItem('punchx_cfg_services', JSON.stringify(updated));
    showNotification('✓ Service deleted from catalog.');
  };

  const handleToggleService = (id: string) => {
    const updated = services.map(s => s.id === id ? { ...s, available: !s.available } : s);
    setServices(updated);
    localStorage.setItem('punchx_cfg_services', JSON.stringify(updated));
    showNotification('✓ Service availability updated.');
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="bg-[#11192e] border border-[#c5a059]/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            ⚙️ Dynamic Platform & Service Management
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Add, edit, or remove catalog services, modify 30-day guarantee rules, and adjust dispatch pricing anytime.
          </p>
        </div>
      </div>

      {/* Guarantee & Surcharges Config */}
      <div className="bg-[#11192e] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#e9c176]" />
          30-Day Guarantee & Dispatch Rate Rules
        </h3>
        
        <form onSubmit={handleSaveRates} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="space-y-1 bg-[#07122a] p-3 rounded-2xl border border-zinc-800">
            <label className="text-zinc-400 font-bold block">30-Day Guarantee Fee (₹)</label>
            <span className="text-[10px] text-zinc-500 block mb-1">Customer Opt-in charge</span>
            <input
              type="number"
              value={warrantyFee}
              onChange={(e) => setWarrantyFee(Number(e.target.value))}
              className="w-full bg-[#0b1325] border border-zinc-700 focus:border-[#c5a059] rounded-xl p-2 text-white font-bold text-sm outline-none"
            />
          </div>

          <div className="space-y-1 bg-[#07122a] p-3 rounded-2xl border border-zinc-800">
            <label className="text-zinc-400 font-bold block">Specialist Revisit Fee (₹)</label>
            <span className="text-[10px] text-zinc-500 block mb-1">Paid to pro on ₹0 rebooking</span>
            <input
              type="number"
              value={visitingSubsidy}
              onChange={(e) => setVisitingSubsidy(Number(e.target.value))}
              className="w-full bg-[#0b1325] border border-zinc-700 focus:border-[#c5a059] rounded-xl p-2 text-emerald-400 font-bold text-sm outline-none"
            />
          </div>

          <div className="space-y-1 bg-[#07122a] p-3 rounded-2xl border border-zinc-800">
            <label className="text-zinc-400 font-bold block">Emergency SOS Surcharge (₹)</label>
            <span className="text-[10px] text-zinc-500 block mb-1">Fast-track dispatch extra</span>
            <input
              type="number"
              value={emergencyFee}
              onChange={(e) => setEmergencyFee(Number(e.target.value))}
              className="w-full bg-[#0b1325] border border-zinc-700 focus:border-[#c5a059] rounded-xl p-2 text-red-400 font-bold text-sm outline-none"
            />
          </div>

          <div className="space-y-1 bg-[#07122a] p-3 rounded-2xl border border-zinc-800">
            <label className="text-zinc-400 font-bold block">Personal Pro Select (₹)</label>
            <span className="text-[10px] text-zinc-500 block mb-1">Direct chosen specialist fee</span>
            <input
              type="number"
              value={personalFee}
              onChange={(e) => setPersonalFee(Number(e.target.value))}
              className="w-full bg-[#0b1325] border border-zinc-700 focus:border-[#c5a059] rounded-xl p-2 text-[#e9c176] font-bold text-sm outline-none"
            />
          </div>

          <div className="col-span-full pt-2">
            <button
              type="submit"
              className="py-3 px-6 bg-[#c5a059] hover:bg-[#e9c176] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Rate Configurations
            </button>
          </div>
        </form>
      </div>

      {/* Dynamic Catalog Services */}
      <div className="bg-[#11192e] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#c5a059]" />
          Dynamic Service Catalog & Custom Offerings
        </h3>

        {/* Add New Service Form */}
        <form onSubmit={handleAddService} className="bg-[#07122a] border border-zinc-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Service Title *</label>
            <input
              type="text"
              placeholder="e.g. Geyser Element Replacement"
              required
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="w-full bg-[#0b1325] border border-zinc-700 rounded-xl p-2 text-white outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Category</label>
            <select
              value={newServiceCategory}
              onChange={(e) => setNewServiceCategory(e.target.value)}
              className="w-full bg-[#0b1325] border border-zinc-700 rounded-xl p-2 text-white outline-none focus:border-[#c5a059]"
            >
              <option value="AC Repair">AC Repair</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Appliance Repair">Appliance Repair</option>
              <option value="Carpentry">Carpentry</option>
            </select>
          </div>

          <div className="space-y-1 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-mono shadow"
            >
              <PlusCircle className="w-4 h-4" /> Add Service
            </button>
          </div>
        </form>

        {/* Services Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#07122a] text-zinc-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Service Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Base Price</th>
                <th className="p-3">Availability</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 font-sans">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-[#07122a]/50">
                  <td className="p-3 font-bold text-white">{srv.name}</td>
                  <td className="p-3 text-zinc-400">{srv.category}</td>
                  <td className="p-3 font-mono font-bold text-[#e9c176]">₹{srv.basePrice}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleService(srv.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold cursor-pointer ${
                        srv.available ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {srv.available ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-1.5 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded-lg cursor-pointer transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
