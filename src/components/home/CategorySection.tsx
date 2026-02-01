import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Shirt, Home, Dumbbell, Car, Book, Gamepad2, Package, User, Baby } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

// Icon configuration with vibrant colors for each category
const iconConfig: Record<string, { icon: React.ReactNode; bgColor: string; iconColor: string }> = {
  Smartphone: { 
    icon: <Smartphone className="h-7 w-7" />, 
    bgColor: 'bg-blue-500/20', 
    iconColor: 'text-blue-500' 
  },
  Shirt: { 
    icon: <Shirt className="h-7 w-7" />, 
    bgColor: 'bg-pink-500/20', 
    iconColor: 'text-pink-500' 
  },
  Home: { 
    icon: <Home className="h-7 w-7" />, 
    bgColor: 'bg-emerald-500/20', 
    iconColor: 'text-emerald-500' 
  },
  Dumbbell: { 
    icon: <Dumbbell className="h-7 w-7" />, 
    bgColor: 'bg-cyan-500/20', 
    iconColor: 'text-cyan-500' 
  },
  Car: { 
    icon: <Car className="h-7 w-7" />, 
    bgColor: 'bg-orange-500/20', 
    iconColor: 'text-orange-500' 
  },
  Book: { 
    icon: <Book className="h-7 w-7" />, 
    bgColor: 'bg-purple-500/20', 
    iconColor: 'text-purple-500' 
  },
  Gamepad2: { 
    icon: <Gamepad2 className="h-7 w-7" />, 
    bgColor: 'bg-red-500/20', 
    iconColor: 'text-red-500' 
  },
  Package: { 
    icon: <Package className="h-7 w-7" />, 
    bgColor: 'bg-slate-500/20', 
    iconColor: 'text-slate-400' 
  },
  User: { 
    icon: <User className="h-7 w-7" />, 
    bgColor: 'bg-indigo-500/20', 
    iconColor: 'text-indigo-500' 
  },
  Baby: { 
    icon: <Baby className="h-7 w-7" />, 
    bgColor: 'bg-amber-500/20', 
    iconColor: 'text-amber-500' 
  },
};

const defaultIcon = { 
  icon: <Package className="h-7 w-7" />, 
  bgColor: 'bg-slate-500/20', 
  iconColor: 'text-slate-400' 
};

export const CategorySection: React.FC = () => {
  const { data: categories, isLoading } = useCategories();

  // Filter to show only parent categories (no parent_id)
  const parentCategories = categories?.filter(cat => !cat.parent_id) || [];

  if (isLoading) {
    return (
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6">Cumpără după Categorie</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6">Cumpără după Categorie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
          {parentCategories.map((category) => {
            const config = category.icon ? iconConfig[category.icon] || defaultIcon : defaultIcon;
            
            return (
              <Link
                key={category.id}
                to={`/browse?category=${category.slug}`}
                className="group flex flex-col items-center justify-center p-4 md:p-5 rounded-xl bg-secondary/80 hover:bg-primary/10 border border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 aspect-[4/3]"
              >
                <div className={`p-3 rounded-full ${config.bgColor} ${config.iconColor} transition-all duration-300 group-hover:scale-110 mb-2`}>
                  {config.icon}
                </div>
                <span className="text-xs md:text-sm font-medium text-center group-hover:text-primary transition-colors leading-tight">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
