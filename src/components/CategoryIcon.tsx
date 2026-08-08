import React from 'react';
import { 
  Zap, 
  Droplet, 
  Sparkles, 
  Wind, 
  Paintbrush, 
  Hammer, 
  Bug, 
  Truck, 
  Wrench,
  LucideProps
} from 'lucide-react';

export const getCategoryIcon = (categoryName: string): React.ComponentType<LucideProps> => {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('elect')) return Zap;
  if (name.includes('plumb')) return Droplet;
  if (name.includes('clean') || name.includes('care') || name.includes('sanit')) return Sparkles;
  if (name.includes('ac') || name.includes('air') || name.includes('cool')) return Wind;
  if (name.includes('paint')) return Paintbrush;
  if (name.includes('carpent') || name.includes('wood') || name.includes('join')) return Hammer;
  if (name.includes('pest') || name.includes('bug')) return Bug;
  if (name.includes('mov') || name.includes('pack') || name.includes('ship')) return Truck;
  return Wrench;
};

export const getCategoryColor = (categoryName: string): string => {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('elect')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
  if (name.includes('plumb')) return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
  if (name.includes('clean') || name.includes('care') || name.includes('sanit')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  if (name.includes('ac') || name.includes('air') || name.includes('cool')) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
  if (name.includes('paint')) return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
  if (name.includes('carpent') || name.includes('wood') || name.includes('join')) return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
  if (name.includes('pest') || name.includes('bug')) return 'bg-red-500/20 text-red-400 border-red-500/40';
  if (name.includes('mov') || name.includes('pack') || name.includes('ship')) return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
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
