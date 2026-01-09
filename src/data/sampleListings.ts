import laptopImg from '@/assets/laptop.jpg';
import headphonesImg from '@/assets/headphones.jpg';
import coatImg from '@/assets/coat.jpg';
import phoneImg from '@/assets/phone.jpg';
import drillImg from '@/assets/drill.jpg';
import sneakersImg from '@/assets/sneakers.jpg';

export const sampleListings = [
  {
    id: 'sample-1',
    title: 'MacBook Pro 15" - Excellent Condition',
    description: 'Used MacBook Pro in great condition. 16GB RAM, 512GB SSD. Battery health at 89%. Comes with charger.',
    price: 899,
    condition: 'like_new' as const,
    location: 'New York, NY',
    image: laptopImg,
    category: 'electronics',
  },
  {
    id: 'sample-2',
    title: 'Sony Wireless Headphones WH-1000XM4',
    description: 'Premium noise cancelling headphones. Barely used, includes original case and cables.',
    price: 199,
    condition: 'like_new' as const,
    location: 'Los Angeles, CA',
    image: headphonesImg,
    category: 'electronics',
  },
  {
    id: 'sample-3',
    title: 'Winter Jacket - Size L',
    description: 'Warm winter coat, perfect for cold weather. Worn only a few times last season.',
    price: 75,
    condition: 'good' as const,
    location: 'Chicago, IL',
    image: coatImg,
    category: 'fashion',
  },
  {
    id: 'sample-4',
    title: 'iPhone 13 Pro - 256GB',
    description: 'Unlocked iPhone 13 Pro in Space Gray. Minor scratches on back, screen is perfect.',
    price: 649,
    condition: 'good' as const,
    location: 'Miami, FL',
    image: phoneImg,
    category: 'electronics',
  },
  {
    id: 'sample-5',
    title: 'DeWalt Power Drill Set',
    description: 'Professional grade cordless drill with 2 batteries and full bit set. Great for DIY projects.',
    price: 120,
    condition: 'good' as const,
    location: 'Houston, TX',
    image: drillImg,
    category: 'home-garden',
  },
  {
    id: 'sample-6',
    title: 'Running Sneakers - Size 10',
    description: 'Comfortable running shoes, lightly used. Great for jogging or casual wear.',
    price: 45,
    condition: 'fair' as const,
    location: 'Seattle, WA',
    image: sneakersImg,
    category: 'fashion',
  },
];
