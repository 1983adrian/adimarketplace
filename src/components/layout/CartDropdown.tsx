import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Badge } from '@/components/ui/badge';

export const CartDropdown: React.FC = () => {
  const { items, removeItem, itemCount, total } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs gradient-primary border-0"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 shadow-dropdown">
        <div className="px-3 py-2 border-b border-border">
          <p className="font-semibold text-sm flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Coș de cumpărături ({itemCount})
          </p>
        </div>
        
        {items.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Coșul este gol</p>
          </div>
        ) : (
          <>
            <div className="max-h-64 overflow-y-auto">
              {items.map((item) => (
                <DropdownMenuItem key={item.id} className="p-2 cursor-default" onSelect={(e) => e.preventDefault()}>
                  <div className="flex items-center gap-3 w-full">
                    <img 
                      src={item.image_url || '/placeholder.svg'} 
                      alt={item.title} 
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-sm text-primary font-semibold">{formatPrice(item.price)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            
            <DropdownMenuSeparator />
            
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-bold text-lg">{formatPrice(total)}</span>
              </div>
              <Button asChild className="w-full gradient-primary">
                <Link to="/checkout">
                  Finalizează comanda
                </Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
