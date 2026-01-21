import React from 'react';
import { Shield, Truck, Star } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const features = [
    { 
      icon: Shield, 
      text: 'Buyer Protection', 
      subtext: 'Plăți securizate',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    { 
      icon: Truck, 
      text: 'Fast Delivery', 
      subtext: 'Livrare cu tracking',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    { 
      icon: Star, 
      text: 'Trusted Sellers', 
      subtext: 'Recenzii verificate',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
          {features.map(({ icon: Icon, text, subtext, color, bgColor }) => (
            <div 
              key={text} 
              className="flex flex-col items-center gap-3 text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className={`p-4 rounded-2xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-6 w-6 md:h-8 md:w-8 ${color}`} strokeWidth={2} />
              </div>
              <div>
                <p className="font-bold text-sm md:text-base text-foreground">{text}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
