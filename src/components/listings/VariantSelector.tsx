import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Ruler, Palette } from 'lucide-react';

interface VariantSelectorProps {
  sizes?: string[] | null;
  colors?: string[] | null;
  selectedSize: string | null;
  selectedColor: string | null;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  quantity?: number | null;
}

export const VariantSelector = ({
  sizes,
  colors,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
  quantity,
}: VariantSelectorProps) => {
  const hasSizes = sizes && sizes.length > 0;
  const hasColors = colors && colors.length > 0;

  if (!hasSizes && !hasColors) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
      {/* Size Selection */}
      {hasSizes && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Ruler className="h-4 w-4" />
            Alege Mărimea *
          </Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Badge
                key={size}
                variant={selectedSize === size ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 text-sm transition-all hover:scale-105 ${
                  selectedSize === size 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                    : 'hover:bg-primary/10 hover:border-primary'
                }`}
                onClick={() => onSizeChange(size)}
              >
                {size}
              </Badge>
            ))}
          </div>
          {!selectedSize && (
            <p className="text-xs text-orange-600 font-medium">
              ⚠️ Te rugăm să selectezi o mărime pentru a putea cumpăra
            </p>
          )}
        </div>
      )}

      {/* Color Selection */}
      {hasColors && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Palette className="h-4 w-4" />
            Alege Culoarea *
          </Label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <Badge
                key={color}
                variant={selectedColor === color ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 text-sm transition-all hover:scale-105 ${
                  selectedColor === color 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                    : 'hover:bg-primary/10 hover:border-primary'
                }`}
                onClick={() => onColorChange(color)}
              >
                {color}
              </Badge>
            ))}
          </div>
          {!selectedColor && (
            <p className="text-xs text-orange-600 font-medium">
              ⚠️ Te rugăm să selectezi o culoare pentru a putea cumpăra
            </p>
          )}
        </div>
      )}

      {/* Stock info */}
      {quantity && quantity > 0 && (
        <p className="text-xs text-muted-foreground pt-2 border-t">
          📦 {quantity} {quantity === 1 ? 'bucată disponibilă' : 'bucăți disponibile'}
        </p>
      )}
    </div>
  );
};
