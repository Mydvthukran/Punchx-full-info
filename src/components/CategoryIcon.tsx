import React from 'react';
import { 
  Zap, 
  Droplet, 
  Droplets,
  Sparkles, 
  Wind, 
  Paintbrush, 
  Hammer, 
  Bug, 
  Truck, 
  Wrench,
  Scissors,
  Bike,
  Car,
  Snowflake,
  Waves,
  Smartphone,
  Laptop,
  Tv,
  Video,
  Sun,
  Key,
  Sprout,
  Utensils,
  Cake,
  Package,
  Camera,
  GraduationCap,
  Calculator,
  Palette,
  Wifi,
  Printer,
  HardHat,
  Wheat,
  Tractor,
  HelpCircle,
  Flame,
  LucideProps
} from 'lucide-react';

export const getCategoryIcon = (categoryName: string): React.ComponentType<LucideProps> => {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('elect') || name.includes('wire')) return Zap;
  if (name.includes('plumb') || name.includes('tap') || name.includes('leak')) return Droplet;
  if (name.includes('carpent') || name.includes('wood') || name.includes('join')) return Hammer;
  if (name.includes('paint')) return Paintbrush;
  if (name.includes('mason') || name.includes('brick') || name.includes('cement')) return HardHat;
  if (name.includes('weld')) return Flame;
  if (name.includes('barber') || name.includes('hair') || name.includes('tailor') || name.includes('stitch')) return Scissors;
  if (name.includes('beauty') || name.includes('makeup') || name.includes('spa') || name.includes('facial')) return Sparkles;
  if (name.includes('bike') || name.includes('scooter') || name.includes('two wheeler')) return Bike;
  if (name.includes('car mechanic') || name.includes('car') || name.includes('driver')) return Car;
  if (name.includes('ac') || name.includes('air') || name.includes('cool')) return Wind;
  if (name.includes('fridge') || name.includes('refrigerat')) return Snowflake;
  if (name.includes('washing machine') || name.includes('laundry') || name.includes('iron')) return Waves;
  if (name.includes('mobile') || name.includes('phone') || name.includes('tablet')) return Smartphone;
  if (name.includes('computer') || name.includes('laptop') || name.includes('pc')) return Laptop;
  if (name.includes('electronic') || name.includes('tv')) return Tv;
  if (name.includes('cctv') || name.includes('video') || name.includes('surveillance')) return Video;
  if (name.includes('solar')) return Sun;
  if (name.includes('ro') || name.includes('purifier') || name.includes('pump') || name.includes('irrigation')) return Droplets;
  if (name.includes('lock')) return Key;
  if (name.includes('clean') || name.includes('maid') || name.includes('housekeep')) return Sparkles;
  if (name.includes('pest') || name.includes('bug')) return Bug;
  if (name.includes('garden') || name.includes('plant')) return Sprout;
  if (name.includes('cook') || name.includes('cater') || name.includes('chef')) return Utensils;
  if (name.includes('bake') || name.includes('cake')) return Cake;
  if (name.includes('tiffin') || name.includes('delivery') || name.includes('pack')) return Package;
  if (name.includes('photo') || name.includes('camera')) return Camera;
  if (name.includes('mehendi') || name.includes('graphic') || name.includes('design')) return Palette;
  if (name.includes('tutor') || name.includes('teacher') || name.includes('tuition')) return GraduationCap;
  if (name.includes('account') || name.includes('tax') || name.includes('bookkeep')) return Calculator;
  if (name.includes('wifi') || name.includes('internet') || name.includes('broadband')) return Wifi;
  if (name.includes('print') || name.includes('stationery')) return Printer;
  if (name.includes('decor') || name.includes('event')) return Sparkles;
  if (name.includes('construct') || name.includes('labor')) return HardHat;
  if (name.includes('agri') || name.includes('farm')) return Wheat;
  if (name.includes('tractor')) return Tractor;
  if (name.includes('moving') || name.includes('ship')) return Truck;
  if (name.includes('other')) return HelpCircle;
  return Wrench;
};

export const getCategoryColor = (categoryName: string): string => {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('elect') || name.includes('solar')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
  if (name.includes('plumb') || name.includes('ro') || name.includes('pump') || name.includes('wash')) return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
  if (name.includes('clean') || name.includes('garden') || name.includes('agri')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  if (name.includes('ac') || name.includes('fridge') || name.includes('wifi')) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
  if (name.includes('paint') || name.includes('beauty') || name.includes('makeup') || name.includes('mehendi')) return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
  if (name.includes('carpent') || name.includes('mason') || name.includes('construct')) return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
  if (name.includes('pest') || name.includes('weld')) return 'bg-red-500/20 text-red-400 border-red-500/40';
  if (name.includes('mov') || name.includes('deliver') || name.includes('tiffin')) return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
  if (name.includes('photo') || name.includes('video') || name.includes('cctv')) return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
  if (name.includes('tutor') || name.includes('account')) return 'bg-teal-500/20 text-teal-400 border-teal-500/40';
  return 'bg-[#c5a059]/20 text-[#e9c176] border-[#c5a059]/40';
};

interface CategoryIconProps extends LucideProps {
  category: string;
  className?: string;
}

export default function CategoryIcon({ category, ...props }: CategoryIconProps) {
  const IconComponent = getCategoryIcon(category);
  return <IconComponent {...props} />;
}

interface ProfileBadgeProps {
  category: string;
  className?: string;
  sizeClassName?: string;
}

export function CategoryProfileBadge({ category, className = '', sizeClassName = 'w-5 h-5 p-1' }: ProfileBadgeProps) {
  const colorClass = getCategoryColor(category);
  return (
    <div className={`absolute -top-1.5 -right-1.5 rounded-full border shadow-lg flex items-center justify-center z-10 ${colorClass} ${sizeClassName} ${className}`}>
      <CategoryIcon category={category} className="w-full h-full" />
    </div>
  );
}

