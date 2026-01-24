import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Shirt, Home, Dumbbell, Car, Book, Gamepad2, Package, User, Baby } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="h-7 w-7" />,
  Shirt: <Shirt className="h-7 w-7" />,
  Home: <Home className="h-7 w-7" />,
  Dumbbell: <Dumbbell className="h-7 w-7" />,
  Car: <Car className="h-7 w-7" />,
  Book: <Book className="h-7 w-7" />,
  Gamepad2: <Gamepad2 className="h-7 w-7" />,
  Package: <Package className="h-7 w-7" />,
  User: <User className="h-7 w-7" />,
  Baby: <Baby className="h-7 w-7" />,
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
          {parentCategories.map((category) => (
            <Link
              key={category.id}
              to={`/browse?category=${category.slug}`}
              className="group flex flex-col items-center justify-center p-4 md:p-5 rounded-xl bg-secondary/80 hover:bg-primary/10 border border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 aspect-[4/3]"
            >
              <div className="text-muted-foreground group-hover:text-primary transition-colors mb-2 p-3 rounded-full bg-muted/50 group-hover:bg-primary/10">
                {category.icon ? iconMap[category.icon] || <Package className="h-7 w-7" /> : <Package className="h-7 w-7" />}
              </div>
              <span className="text-xs md:text-sm font-medium text-center group-hover:text-primary transition-colors leading-tight">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
