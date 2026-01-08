import React from 'react';
import { Camera, MessageCircle, CreditCard, Package } from 'lucide-react';

const steps = [
  {
    icon: Camera,
    title: 'List Your Item',
    description: 'Take photos, write a description, and set your price. It only takes a minute.',
  },
  {
    icon: MessageCircle,
    title: 'Connect with Buyers',
    description: 'Chat with interested buyers directly through our secure messaging system.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Receive payment safely through our protected payment system.',
  },
  {
    icon: Package,
    title: 'Ship & Done',
    description: 'Ship the item to the buyer and get paid. Simple as that!',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Selling your items has never been easier. Follow these simple steps to get started.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
