import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Shirt, Home, Dumbbell, Car, Book, Gamepad2, Package } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="h-8 w-8" />,
  Shirt: <Shirt className="h-8 w-8" />,
  Home: <Home className="h-8 w-8" />,
  Dumbbell: <Dumbbell className="h-8 w-8" />,
  Car: <Car className="h-8 w-8" />,
  Book: <Book className="h-8 w-8" />,
  Gamepad2: <Gamepad2 className="h-8 w-8" />,
  Package: <Package className="h-8 w-8" />,
};

export const CategorySection: React.FC = () => {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories?.map((category) => (
            <Link
              key={category.id}
              to={`/browse?category=${category.slug}`}
              className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-secondary hover:bg-primary/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-muted-foreground group-hover:text-primary transition-colors mb-3">
                {category.icon ? iconMap[category.icon] || <Package className="h-8 w-8" /> : <Package className="h-8 w-8" />}
              </div>
              <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
