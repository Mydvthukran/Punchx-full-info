import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Check, ArrowRight, Sparkles, Filter, 
  CheckCircle2, Briefcase, Plus, AlertCircle, RefreshCw
} from 'lucide-react';
import { PUNCHX_50_CATEGORIES, ServiceCategoryItem, filterCategories } from '../data/categories';
import CategoryIcon, { getCategoryColor } from './CategoryIcon';

export interface ServiceCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'citizen' | 'worker';
  selectedCategory?: string; // For citizen or single select
  selectedCategories?: string[]; // For worker multi-select
  onSelectCategory?: (categoryName: string) => void; // Citizen selection
  onSaveWorkerCategories?: (categories: string[], customSkill?: string) => void; // Worker multi-selection save
  titleOverride?: string;
}

const QUICK_FILTERS = [
  { id: 'all', label: 'All (50)' },
  { id: 'repairs', label: 'Home Repairs', keywords: ['electrician', 'plumber', 'carpenter', 'painter', 'mason', 'locksmith', 'handyman'] },
  { id: 'tech', label: 'Tech & Appliances', keywords: ['ac', 'refrigerator', 'washing', 'mobile', 'computer', 'laptop', 'electronics', 'cctv', 'solar', 'ro', 'appliance', 'wifi'] },
  { id: 'personal', label: 'Personal & Care', keywords: ['barber', 'hair', 'beautician', 'makeup', 'mehendi', 'tailor', 'cleaner', 'tutor'] },
  { id: 'transport', label: 'Vehicles & Logistics', keywords: ['bike', 'car', 'delivery', 'driver', 'tractor'] },
  { id: 'food', label: 'Food & Events', keywords: ['cook', 'baker', 'caterer', 'tiffin', 'photographer', 'videographer', 'event'] },
  { id: 'rural', label: 'Agri & Construction', keywords: ['construction', 'agricultural', 'tractor', 'pump', 'welder', 'shoe'] }
];

export default function ServiceCategoryModal({
  isOpen,
  onClose,
  mode = 'citizen',
  selectedCategory = '',
  selectedCategories,
  onSelectCategory,
  onSaveWorkerCategories,
  titleOverride
}: ServiceCategoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [workerSelectedList, setWorkerSelectedList] = useState<string[]>([]);
  const [customSkillText, setCustomSkillText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const serializedSelectedCategories = (selectedCategories || []).join(',');

  // Sync initial worker selection when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (selectedCategories && selectedCategories.length > 0) {
      setWorkerSelectedList(selectedCategories);
    } else if (selectedCategory) {
      setWorkerSelectedList([selectedCategory]);
    } else {
      setWorkerSelectedList([]);
    }
  }, [isOpen, selectedCategory, serializedSelectedCategories]);

  // Reset search when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveFilterTab('all');
      setShowCustomInput(false);
    }
  }, [isOpen]);

  // Filtered categories based on search input & quick filters
  const filteredList = useMemo(() => {
    let list = filterCategories(searchQuery);

    if (activeFilterTab !== 'all' && !searchQuery.trim()) {
      const currentTab = QUICK_FILTERS.find(f => f.id === activeFilterTab);
      if (currentTab?.keywords) {
        list = list.filter(item => 
          currentTab.keywords.some(k => item.id.includes(k) || item.name.toLowerCase().includes(k))
        );
      }
    }
    return list;
  }, [searchQuery, activeFilterTab]);

  // Toggle selection for worker multi-select
  const handleToggleWorkerCategory = (catName: string) => {
    if (catName === 'Other Service') {
      setShowCustomInput(!showCustomInput);
    }
    setWorkerSelectedList(prev => {
      if (prev.includes(catName)) {
        return prev.filter(c => c !== catName);
      } else {
        return [...prev, catName];
      }
    });
  };

  // Select for citizen single-select
  const handleCitizenSelect = (catName: string) => {
    if (catName === 'Other Service') {
      setShowCustomInput(true);
      return;
    }
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    onClose();
  };

  // Submit custom skill
  const handleSaveCustomSkill = () => {
    if (!customSkillText.trim()) return;
    const finalName = customSkillText.trim();
    if (mode === 'citizen') {
      if (onSelectCategory) onSelectCategory(finalName);
      onClose();
    } else {
      const updated = Array.from(new Set([...workerSelectedList, finalName]));
      setWorkerSelectedList(updated);
      if (onSaveWorkerCategories) {
        onSaveWorkerCategories(updated, finalName);
      }
      onClose();
    }
  };

  // Confirm worker multi-selection
  const handleConfirmWorkerCategories = () => {
    if (onSaveWorkerCategories) {
      onSaveWorkerCategories(
        workerSelectedList.length > 0 ? workerSelectedList : ['Handyman'],
        customSkillText.trim() || undefined
      );
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="service-category-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden"
      >
        <motion.div
          id="service-category-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-[#0b1428] border border-[#c5a059]/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Top Header */}
          <div className="p-4 sm:p-6 pb-3 border-b border-zinc-800 bg-[#070e1d]/90 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#e9c176] font-extrabold">
                  {mode === 'worker' ? 'WORKER SERVICE SELECTION' : 'CITIZEN INSTANT BOOKING'}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                  50 Services Available
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {titleOverride || (mode === 'worker' ? 'What service do you provide?' : 'What service do you need?')}
              </h2>
              <p className="text-xs text-zinc-400">
                {mode === 'worker' 
                  ? 'Select all the trade categories you are certified and equipped to perform.'
                  : 'Select an authorized specialist trade for immediate GPS dispatch and verified service.'}
              </p>
            </div>

            <button
              id="close-category-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-750 transition-colors cursor-pointer flex-shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar Section */}
          <div className="p-4 sm:px-6 sm:py-4 bg-[#091122] border-b border-zinc-800/80 space-y-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c5a059]/20 to-emerald-500/10 blur-sm rounded-2xl opacity-60 pointer-events-none"></div>
              <div className="relative bg-[#070e1d] border-2 border-[#c5a059]/50 focus-within:border-[#c5a059] rounded-2xl flex items-center px-4 py-3 shadow-inner">
                <Search className="w-5 h-5 text-[#e9c176] flex-shrink-0 mr-3" />
                <input
                  id="category-search-input"
                  type="text"
                  autoFocus
                  placeholder={mode === 'worker' ? '🔍 Search for your service...' : '🔍 Search for a service or worker...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-400 focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white bg-zinc-800/80 text-xs font-mono ml-2 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Segment Filter Pills */}
            {!searchQuery && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {QUICK_FILTERS.map((filter) => {
                  const isActive = activeFilterTab === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilterTab(filter.id)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                        isActive
                          ? 'bg-[#c5a059] text-black shadow-md border border-[#ffd587]'
                          : 'bg-[#0f1d38] text-zinc-300 hover:text-white hover:bg-[#16294d] border border-zinc-800'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Skill / Other Service Expandable Input */}
          <AnimatePresence>
            {showCustomInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#111f3d] border-b border-[#c5a059]/40 p-4 px-6 flex flex-col sm:flex-row items-center gap-3"
              >
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-mono uppercase text-[#e9c176] font-bold block mb-1">
                    Specify Custom / Other Service Name:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solar Inverter PCB Repair, Chimney Pipe Ducting..."
                    value={customSkillText}
                    onChange={(e) => setCustomSkillText(e.target.value)}
                    className="w-full bg-[#070e1d] border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#c5a059]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveCustomSkill}
                  className="w-full sm:w-auto mt-2 sm:mt-4 px-5 py-2.5 bg-[#c5a059] text-black font-mono font-bold text-xs rounded-xl hover:bg-[#e9c176] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Use This Custom Service</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Summary Count */}
          <div className="px-6 py-2 bg-[#081020] border-b border-zinc-850 flex justify-between items-center text-[11px] font-mono text-zinc-400">
            <span>
              Showing <strong className="text-white">{filteredList.length}</strong> of 50 Categories
              {searchQuery && <span> matching "{searchQuery}"</span>}
            </span>

            {mode === 'worker' && (
              <span className="text-[#e9c176] font-bold">
                {workerSelectedList.length} Selected (Multi-choice active)
              </span>
            )}
          </div>

          {/* Scrollable Categories Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
            {filteredList.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-[#c5a059] mx-auto opacity-70" />
                <p className="text-sm text-zinc-300 font-medium">
                  No direct category found matching "<span className="text-white font-bold">{searchQuery}</span>".
                </p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Try searching related words like "pipe", "wire", "cool", "clean", "cook", "driver", or click "Other Service" below.
                </p>
                <button
                  onClick={() => {
                    setShowCustomInput(true);
                    setCustomSkillText(searchQuery);
                  }}
                  className="mt-2 px-4 py-2 bg-[#c5a059]/20 hover:bg-[#c5a059] text-[#e9c176] hover:text-black border border-[#c5a059]/40 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  + Add "{searchQuery}" as Custom Service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                {filteredList.map((cat, index) => {
                  const isWorkerSelected = workerSelectedList.includes(cat.name);
                  const isCitizenActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                  const isSelected = mode === 'worker' ? isWorkerSelected : isCitizenActive;

                  return (
                    <motion.div
                      key={cat.id}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        if (mode === 'worker') {
                          handleToggleWorkerCategory(cat.name);
                        } else {
                          handleCitizenSelect(cat.name);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative select-none ${
                        isSelected
                          ? 'bg-[#152342] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.25)] ring-1 ring-[#c5a059]'
                          : 'bg-[#0e1933]/70 hover:bg-[#132244] border-zinc-800 hover:border-[#c5a059]/40'
                      }`}
                    >
                      {/* Left Category Icon */}
                      <div 
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-[#c5a059] text-black border-white shadow-md'
                            : 'bg-[#070e1d] text-[#e9c176] border-zinc-700'
                        }`}
                      >
                        <CategoryIcon category={cat.name} className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-zinc-400">#{index + 1}</span>
                          <h3 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-[#e9c176]' : 'text-white'}`}>
                            {cat.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                          {cat.shortDesc}
                        </p>
                      </div>

                      {/* Right Indicator (Checkbox for worker, Arrow for citizen) */}
                      <div className="absolute top-3.5 right-3">
                        {mode === 'worker' ? (
                          <div 
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                              isWorkerSelected 
                                ? 'bg-emerald-500 border-emerald-400 text-black shadow' 
                                : 'bg-[#070e1d] border-zinc-700 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className={`p-1 rounded-lg ${isSelected ? 'text-[#e9c176]' : 'text-zinc-600 group-hover:text-zinc-300'}`}>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-zinc-800 bg-[#070e1d] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
              <span>
                {mode === 'worker'
                  ? 'All selected trade services will be registered in your verified technician badge.'
                  : 'Fast GPS matching pairs you with active technicians in your exact precinct.'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              {mode === 'worker' && (
                <button
                  type="button"
                  onClick={handleConfirmWorkerCategories}
                  className="w-1/2 sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#c5a059] to-[#e9c176] text-black rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider hover:brightness-110 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Provided Services ({workerSelectedList.length})</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
