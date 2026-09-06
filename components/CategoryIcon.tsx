import React from 'react';
import {
  Utensils,
  UtensilsCrossed,
  Pizza,
  Coffee,
  Fish,
  Flame,
  Sparkles,
  Layers,
  ChefHat,
  SunMedium,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  slug?: string;
  name?: string;
  iconName?: string;
}

export default function CategoryIcon({ slug, name, iconName, className = 'w-5 h-5', ...props }: CategoryIconProps) {
  const identifier = (slug || name || iconName || '').toLowerCase();

  if (identifier.includes('foul') || identifier.includes('falafel') || identifier.includes('فول')) {
    return <Utensils className={className} {...props} />;
  }
  if (identifier.includes('fries') || identifier.includes('بطاطس')) {
    return <Flame className={className} {...props} />;
  }
  if (identifier.includes('cheese') || identifier.includes('جبنة')) {
    return <Layers className={className} {...props} />;
  }
  if (identifier.includes('pizza') || identifier.includes('بيتزا')) {
    return <Pizza className={className} {...props} />;
  }
  if (identifier.includes('crepe') || identifier.includes('كريب')) {
    return <ChefHat className={className} {...props} />;
  }
  if (identifier.includes('feteer') || identifier.includes('فطير')) {
    return <SunMedium className={className} {...props} />;
  }
  if (identifier.includes('shawarma') || identifier.includes('شاورما')) {
    return <UtensilsCrossed className={className} {...props} />;
  }
  if (identifier.includes('fish') || identifier.includes('feseekh') || identifier.includes('فسيخ') || identifier.includes('رنجة')) {
    return <Fish className={className} {...props} />;
  }
  if (identifier.includes('drink') || identifier.includes('مشروب') || identifier.includes('شاي') || identifier.includes('قهوة')) {
    return <Coffee className={className} {...props} />;
  }

  return <Sparkles className={className} {...props} />;
}
