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
  Sandwich,
  Cake,
  Package,
  Drumstick,
  Soup,
  PlusCircle,
  Scale,
  Salad,
  Fingerprint,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  slug?: string;
  name?: string;
  iconName?: string;
}

export default function CategoryIcon({ slug, name, iconName, className = 'w-5 h-5', ...props }: CategoryIconProps) {
  const identifier = (slug || name || iconName || '').toLowerCase();

  if (identifier.includes('box') || identifier.includes('بوكس')) {
    return <Package className={className} {...props} />;
  }
  if (identifier.includes('kilo') || identifier.includes('كيلو') || identifier.includes('scale') || identifier.includes('وزن')) {
    return <Scale className={className} {...props} />;
  }
  if (identifier.includes('basmat') || identifier.includes('بصمات') || identifier.includes('fingerprint') || identifier.includes('سلط') || identifier.includes('مخلل')) {
    return <Salad className={className} {...props} />;
  }
  if (identifier.includes('helw') || identifier.includes('حلو') || identifier.includes('cake') || identifier.includes('sweet')) {
    return <Cake className={className} {...props} />;
  }
  if (identifier.includes('hadek') || identifier.includes('حادق') || identifier.includes('sandwich') || identifier.includes('سندوتش')) {
    return <Sandwich className={className} {...props} />;
  }
  if (identifier.includes('strip') || identifier.includes('استربس')) {
    return <Drumstick className={className} {...props} />;
  }
  if (identifier.includes('mac') || identifier.includes('cheese') || identifier.includes('جبنة')) {
    return <Soup className={className} {...props} />;
  }
  if (identifier.includes('fries') || identifier.includes('بطاطس')) {
    return <Flame className={className} {...props} />;
  }
  if (identifier.includes('meal') || identifier.includes('وجبات') || identifier.includes('وجبة')) {
    return <Utensils className={className} {...props} />;
  }
  if (identifier.includes('addition') || identifier.includes('إضافات') || identifier.includes('اضافات')) {
    return <PlusCircle className={className} {...props} />;
  }
  if (identifier.includes('foul') || identifier.includes('falafel') || identifier.includes('فول')) {
    return <Utensils className={className} {...props} />;
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
